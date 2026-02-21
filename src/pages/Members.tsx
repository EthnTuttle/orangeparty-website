import { useState } from 'react';
import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { useSeoMeta } from '@unhead/react';
import { useNostr } from '@nostrify/react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { UserPlus, Trash2, ExternalLink, Shield, ArrowLeft, RefreshCw } from 'lucide-react';
import { LoginArea } from '@/components/auth/LoginArea';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useAuthor } from '@/hooks/useAuthor';
import { useOrangePartyMembers } from '@/hooks/useOrangePartyMembers';
import { ORANGE_PARTY_ADMIN_PUBKEYS, ORANGE_PARTY_LIST_DTAG, isOrangePartyAdmin } from '@/lib/orangePartyAdmins';
import { generatePrimalUrl } from '@/lib/nostrUtils';
import { genUserName } from '@/lib/genUserName';
import { useToast } from '@/hooks/useToast';

// Displays a single member row with their avatar and profile info
function MemberRow({ pubkey, name, onRemove, canEdit }: {
  pubkey: string;
  name: string;
  onRemove?: (pubkey: string) => void;
  canEdit: boolean;
}) {
  const author = useAuthor(pubkey);
  const metadata = author.data?.metadata;
  const displayName = metadata?.display_name ?? metadata?.name ?? name;
  const picture = metadata?.picture;
  let npub = pubkey;
  try { npub = nip19.npubEncode(pubkey); } catch { /* keep hex */ }

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="h-9 w-9 shrink-0">
          {picture && <AvatarImage src={picture} alt={displayName} />}
          <AvatarFallback className="bg-orange-100 text-orange-800 text-xs font-medium">
            {displayName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm truncate">{displayName}</span>
            <Badge variant="outline" className="text-xs font-mono shrink-0">{name}</Badge>
            {isOrangePartyAdmin(pubkey) && (
              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 shrink-0">
                <Shield className="h-3 w-3 mr-1" />
                admin
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">
            {npub.substring(0, 20)}…
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-4">
        <a
          href={generatePrimalUrl(pubkey)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="View on Primal"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
        {canEdit && onRemove && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove member</AlertDialogTitle>
                <AlertDialogDescription>
                  Remove <strong>{displayName}</strong> from your Orange Party list? This only affects your list — other admins' lists are unchanged.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onRemove(pubkey)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}

// Panel for admins to manage their own list
function AdminEditPanel({ currentUserPubkey }: { currentUserPubkey: string }) {
  const { nostr } = useNostr();
  const { mutateAsync: publishEvent } = useNostrPublish();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [addInput, setAddInput] = useState('');
  const [addName, setAddName] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [myList, setMyList] = useState<{ pubkey: string; name: string }[] | null>(null);
  const [isLoadingMyList, setIsLoadingMyList] = useState(false);

  // Fetch this admin's current list from Nostr
  const loadMyList = async () => {
    setIsLoadingMyList(true);
    try {
      const events = await nostr.query(
        [{
          kinds: [30000],
          authors: [currentUserPubkey],
          '#d': [ORANGE_PARTY_LIST_DTAG],
          limit: 1,
        }],
        { signal: AbortSignal.timeout(5000) }
      );

      if (events.length > 0) {
        const event = events.sort((a, b) => b.created_at - a.created_at)[0];
        const members = event.tags
          .filter((t) => t[0] === 'p' && t[1])
          .map((t) => ({ pubkey: t[1], name: t[3] ?? t[1].substring(0, 8) }));
        setMyList(members);
      } else {
        setMyList([]);
      }
    } catch {
      toast({ title: 'Failed to load your list', variant: 'destructive' });
    } finally {
      setIsLoadingMyList(false);
    }
  };

  // Resolve an npub/hex input to a hex pubkey
  const resolveInput = (input: string): string | null => {
    const trimmed = input.trim();
    if (/^[0-9a-f]{64}$/.test(trimmed)) return trimmed;
    try {
      const decoded = nip19.decode(trimmed);
      if (decoded.type === 'npub') return decoded.data;
      if (decoded.type === 'nprofile') return decoded.data.pubkey;
    } catch { /* fall through */ }
    return null;
  };

  const handleAdd = () => {
    const pubkey = resolveInput(addInput);
    if (!pubkey) {
      toast({ title: 'Invalid pubkey or npub', variant: 'destructive' });
      return;
    }
    if (myList?.some((m) => m.pubkey === pubkey)) {
      toast({ title: 'Already in your list' });
      return;
    }
    const name = addName.trim() || pubkey.substring(0, 8);
    setMyList((prev) => [...(prev ?? []), { pubkey, name }]);
    setAddInput('');
    setAddName('');
  };

  const handleRemove = (pubkey: string) => {
    setMyList((prev) => (prev ?? []).filter((m) => m.pubkey !== pubkey));
  };

  const handlePublish = async () => {
    if (!myList) return;
    setIsPublishing(true);
    try {
      const pTags = myList.map(({ pubkey, name }) => ['p', pubkey, '', name]);
      await publishEvent({
        kind: 30000,
        content: '',
        tags: [
          ['d', ORANGE_PARTY_LIST_DTAG],
          ['title', 'Orange Party'],
          ...pTags,
        ],
      });
      toast({ title: 'List published', description: 'Your Orange Party list has been updated on Nostr.' });
      // Invalidate so the merged list re-fetches
      queryClient.invalidateQueries({ queryKey: ['orange-party-members'] });
    } catch (err) {
      toast({ title: 'Publish failed', description: String(err), variant: 'destructive' });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Card className="border-orange-200 dark:border-orange-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-500" />
              Manage Your List
            </CardTitle>
            <CardDescription className="mt-1">
              Edit your personal Orange Party follow set. Changes are published as a NIP-51 kind 30000 event.
            </CardDescription>
          </div>
          {myList === null && (
            <Button variant="outline" size="sm" onClick={loadMyList} disabled={isLoadingMyList}>
              {isLoadingMyList ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                'Load my list'
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      {myList !== null && (
        <CardContent className="space-y-4">
          {/* Current list */}
          <div>
            <p className="text-sm font-medium mb-2">
              Your list ({myList.length} {myList.length === 1 ? 'member' : 'members'})
            </p>
            {myList.length === 0 ? (
              <p className="text-sm text-muted-foreground">No members yet. Add some below.</p>
            ) : (
              <div className="divide-y divide-border rounded-md border px-3">
                {myList.map((m) => (
                  <MemberRow
                    key={m.pubkey}
                    pubkey={m.pubkey}
                    name={m.name}
                    onRemove={handleRemove}
                    canEdit
                  />
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Add member */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Add a member</p>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="add-pubkey" className="text-xs text-muted-foreground mb-1 block">
                  npub or hex pubkey
                </Label>
                <Input
                  id="add-pubkey"
                  placeholder="npub1… or hex"
                  value={addInput}
                  onChange={(e) => setAddInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                />
              </div>
              <div className="w-36">
                <Label htmlFor="add-name" className="text-xs text-muted-foreground mb-1 block">
                  Display name
                </Label>
                <Input
                  id="add-name"
                  placeholder="optional"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                />
              </div>
              <div className="flex items-end">
                <Button variant="outline" onClick={handleAdd} disabled={!addInput.trim()}>
                  <UserPlus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          <Button
            onClick={handlePublish}
            disabled={isPublishing}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isPublishing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Publishing…
              </>
            ) : (
              'Publish to Nostr'
            )}
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

export default function Members() {
  useSeoMeta({
    title: 'Members | Orange Party',
    description: 'Orange Party members and list management.',
  });

  const { user } = useCurrentUser();
  const { data: members, isLoading } = useOrangePartyMembers();
  const isAdmin = user ? isOrangePartyAdmin(user.pubkey) : false;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Home</span>
            </Link>
            <Separator orientation="vertical" className="h-5" />
            <h1 className="font-semibold text-lg">Orange Party Members</h1>
          </div>
          <LoginArea className="max-w-48" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Member list — main column */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Current Members</CardTitle>
                <CardDescription>
                  Merged from all admin NIP-51 follow sets on Nostr. Falls back to the static list if no events are found.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 py-2">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div className="space-y-1 flex-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : members && members.length > 0 ? (
                  <div className="divide-y divide-border">
                    {members.map((m) => (
                      <MemberRow
                        key={m.pubkey}
                        pubkey={m.pubkey}
                        name={m.name}
                        canEdit={false}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No members found.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Info card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">How it works</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  The member list is the <strong>union</strong> of all admin NIP-51 kind&nbsp;30000 follow sets tagged <code className="text-xs bg-muted px-1 py-0.5 rounded">orangeparty</code>.
                </p>
                <p>
                  Any admin can add or remove members by publishing an updated list from any Nostr client that supports NIP-51 follow sets (Coracle, Nostrudel, Snort, etc.).
                </p>
                <p className="text-xs">
                  {ORANGE_PARTY_ADMIN_PUBKEYS.length} trusted admin keys · d-tag: <code className="bg-muted px-1 py-0.5 rounded">{ORANGE_PARTY_LIST_DTAG}</code>
                </p>
              </CardContent>
            </Card>

            {/* Admin panel */}
            {user ? (
              isAdmin ? (
                <AdminEditPanel currentUserPubkey={user.pubkey} />
              ) : (
                <Card className="border-dashed">
                  <CardContent className="py-6 text-center text-sm text-muted-foreground">
                    Your key is not a configured admin for this site.
                  </CardContent>
                </Card>
              )
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-6 text-center space-y-3">
                  <p className="text-sm text-muted-foreground">Log in to manage your list</p>
                  <LoginArea className="flex justify-center" />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
