'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ChevronRight,
  ClipboardList,
  CreditCard,
  FileText,
  Globe,
  Info,
  Lightbulb,
  Loader2,
  LogOut,
  User as UserIcon,
  Video,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { handleGenerateScript, createCheckoutSession } from '@/app/actions';
import { Logo } from '@/components/icons/logo';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { Textarea } from '../ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { AuthDialog } from './auth-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const formSchema = z.object({
  topic: z
    .string()
    .min(5, { message: 'Topic must be at least 5 characters.' })
    .max(500, { message: 'Topic must be less than 500 characters.' }),
  contentType: z.enum(['Vlog', 'Tutorial', 'Commentary', 'Review']),
  referenceUrl: z
    .string()
    .url({ message: 'Please enter a valid URL.' })
    .optional()
    .or(z.literal('')),
});

const contentTypes = [
  { id: 'Vlog', icon: Video },
  { id: 'Tutorial', icon: ClipboardList },
  { id: 'Commentary', icon: ClipboardList },
  { id: 'Review', icon: ClipboardList },
];

const FREE_TIER_LIMIT = 3;
const ANONYMOUS_USAGE_KEY = 'anonymousScriptCount';

export function AppLayout() {
  const [generatedScript, setGeneratedScript] = React.useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [isManagingSubscription, setIsManagingSubscription] = React.useState(false);
  const [authDialogOpen, setAuthDialogOpen] = React.useState(false);
  const [anonymousUsage, setAnonymousUsage] = React.useState(0);
  const { toast } = useToast();
  const { user, userData, signOut } = useAuth();

  React.useEffect(() => {
    const storedUsage = localStorage.getItem(ANONYMOUS_USAGE_KEY);
    setAnonymousUsage(storedUsage ? parseInt(storedUsage, 10) : 0);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      topic: '',
      contentType: 'Commentary',
      referenceUrl: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setGeneratedScript(null);

    if (user && userData) {
      if (
        userData.subscriptionTier === 'free' &&
        userData.scriptsGenerated >= FREE_TIER_LIMIT
      ) {
        toast({
          variant: 'destructive',
          title: 'Free Limit Reached',
          description: 'Please upgrade to a paid plan for unlimited script generations.',
        });
        setIsLoading(false);
        return;
      }
    } else {
      if (anonymousUsage >= FREE_TIER_LIMIT) {
        toast({
          variant: 'destructive',
          title: 'Free Limit Reached',
          description: 'Please create an account or log in to continue.',
        });
        setAuthDialogOpen(true);
        setIsLoading(false);
        return;
      }
    }
    
    const result = await handleGenerateScript(values);

    if (result.success && result.data) {
      setGeneratedScript(result.data.script);
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          scriptsGenerated: increment(1),
        });
      } else {
        const newUsage = anonymousUsage + 1;
        setAnonymousUsage(newUsage);
        localStorage.setItem(ANONYMOUS_USAGE_KEY, newUsage.toString());
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description:
          result.error || 'There was a problem generating your script.',
      });
    }
    setIsLoading(false);
  };
  
  const handleManageSubscription = async () => {
    if (!user) {
      setAuthDialogOpen(true);
      return;
    }

    if (!process.env.NEXT_PUBLIC_STRIPE_PRICE_ID) {
      console.error('Stripe Price ID is not set in environment variables.');
      toast({
        variant: 'destructive',
        title: 'Configuration Error',
        description: 'The application is not configured for payments.',
      });
      return;
    }

    setIsManagingSubscription(true);
    const result = await createCheckoutSession(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID);

    if (result.success && result.data?.sessionId) {
      const stripe = await stripePromise;
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId: result.data.sessionId });
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Could not initiate subscription process.',
      });
    }
    setIsManagingSubscription(false);
  };

  const getInitials = (email?: string | null) => {
    return email ? email.charAt(0).toUpperCase() : '?';
  };
  
  const getUsageInfo = () => {
    if (user && userData) {
      if (userData.subscriptionTier === 'paid') {
        return 'Paid Tier';
      }
      return `Free Tier (${userData.scriptsGenerated}/${FREE_TIER_LIMIT})`;
    }
    return `Free Tier (${anonymousUsage}/${FREE_TIER_LIMIT})`;
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex h-full w-full"
          >
            <Sidebar className="w-[320px] border-r border-sidebar-border">
              <SidebarHeader className="p-4 border-b border-sidebar-border">
                <Logo />
                <p className="text-sm text-sidebar-foreground/80 mt-2">
                  Transform any idea into a professional script, matching the
                  style of your favorite content creators.
                </p>
              </SidebarHeader>
              <SidebarContent className="p-0">
                <SidebarGroup className="py-6">
                  <SidebarGroupLabel className="px-4 font-semibold text-sidebar-foreground/80">
                    Select Content Type
                  </SidebarGroupLabel>
                  <FormField
                    control={form.control}
                    name="contentType"
                    render={({ field }) => (
                      <FormItem className="px-4">
                        <FormControl>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {contentTypes.map(({ id, icon: Icon }) => (
                              <Button
                                key={id}
                                type="button"
                                variant={
                                  field.value === id ? 'default' : 'ghost'
                                }
                                onClick={() => field.onChange(id)}
                                className={
                                  field.value === id
                                    ? 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90'
                                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                }
                              >
                                <Icon className="mr-2 h-4 w-4" />
                                {id}
                              </Button>
                            ))}
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </SidebarGroup>

                <SidebarGroup className="py-6">
                  <SidebarGroupLabel className="px-4 font-semibold text-sidebar-foreground/80">
                    Why TubeScript AI?
                  </SidebarGroupLabel>
                  <div className="flex flex-col gap-4 mt-4 px-4">
                      <div className="flex items-start gap-3 text-sm text-sidebar-foreground/80">
                        <Video className="size-4 mt-0.5" /> Match any creator&apos;s style
                      </div>
                      <div className="flex items-start gap-3 text-sm text-sidebar-foreground/80">
                        <Globe className="size-4 mt-0.5" /> Support for multiple
                        platforms
                      </div>
                      <div className="flex items-start gap-3 text-sm text-sidebar-foreground/80">
                        <Info className="size-4 mt-0.5" /> AI-powered suggestions
                      </div>
                  </div>
                </SidebarGroup>

              </SidebarContent>
              <SidebarFooter>
                <Card className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground/80 rounded-none border-t border-l-0 border-r-0 border-b-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base font-semibold text-sidebar-foreground">
                      <Lightbulb className="text-yellow-400" />
                      Pro Tip
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Paste a YouTube URL to perfectly match your favorite
                      creator&apos;s style and tone.
                    </p>
                  </CardContent>
                </Card>
              </SidebarFooter>
            </Sidebar>

            <main className="flex-1 flex flex-col bg-background h-full overflow-hidden">
                <div className="flex-1 overflow-y-auto">
                    <div className="flex flex-col gap-8 max-w-2xl mx-auto p-8 md:p-12">
                        <header className='flex justify-between items-center'>
                        <div>
                            <h1 className="text-4xl font-headline font-bold">
                            Create Your Script
                            </h1>
                            <p className="text-muted-foreground mt-2">
                            Start with your idea, enhance with AI, match any style
                            </p>
                        </div>
                        <div>
                            {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                    <Avatar className="h-10 w-10">
                                    <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? ''} />
                                    <AvatarFallback>
                                        {getInitials(user.email)}
                                    </AvatarFallback>
                                    </Avatar>
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {user.email}
                                    </p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {getUsageInfo()}
                                    </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleManageSubscription} disabled={isManagingSubscription}>
                                    {isManagingSubscription ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    )}
                                    <span>Manage Subscription</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={signOut}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            ) : (
                            <Button onClick={() => setAuthDialogOpen(true)}>
                                <UserIcon className="mr-2 h-4 w-4" />
                                Login
                            </Button>
                            )}
                        </div>
                        </header>

                        <div className="space-y-6">
                        <FormField
                            control={form.control}
                            name="topic"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-semibold flex items-center gap-2">
                                Video Idea
                                </FormLabel>
                                <FormControl>
                                <Textarea
                                    placeholder="What's your video about? (e.g., 'Tech review of the latest...')"
                                    {...field}
                                    className="bg-secondary border-border min-h-[120px]"
                                />
                                </FormControl>
                                <FormDescription>
                                Explain not only the main topic but also key ideas to be
                                included within the script.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="referenceUrl"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-semibold flex items-center gap-2">
                                Reference Video (Optional)
                                </FormLabel>
                                <FormControl>
                                <Input
                                    placeholder="Paste a YouTube URL to match their style"
                                    {...field}
                                    className="bg-secondary border-border"
                                />
                                </FormControl>
                                <FormDescription>
                                Provide a link to a video that has the style you want to
                                emulate.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        </div>

                        <Button
                        type="submit"
                        size="lg"
                        disabled={isLoading}
                        className="self-stretch bg-primary text-primary-foreground hover:bg-primary/90 mt-4"
                        >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                            Generate Script
                            <ChevronRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                        </Button>
                        <div className="flex-1 flex flex-col pb-8">
                            {isLoading && !generatedScript ? (
                            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                                <p className="text-muted-foreground">
                                Generating your script...
                                </p>

                                <div className="space-y-2 w-full">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </div>
                            ) : generatedScript ? (
                            <Card className="flex-1 bg-secondary border-border">
                                <CardContent className="p-4 h-full">
                                <pre className="text-sm whitespace-pre-wrap font-sans h-full overflow-auto p-4">
                                    {generatedScript}
                                </pre>
                                </CardContent>
                            </Card>
                            ) : (
                            <div className="flex-1 flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-background min-h-[200px]">
                                <div className="text-center text-muted-foreground">
                                <FileText className="mx-auto h-12 w-12" />
                                <p className="mt-4">
                                    Your generated script will appear here
                                </p>
                                </div>
                            </div>
                            )}
                        </div>
                    </div>
              </div>
            </main>
          </form>
        </Form>
      </div>
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </div>
  );
}
