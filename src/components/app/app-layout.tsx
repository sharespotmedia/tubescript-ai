'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ChevronRight,
  ClipboardList,
  FileText,
  Globe,
  Info,
  Lightbulb,
  Loader2,
  Video,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { handleGenerateScript } from '@/app/actions';
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

export function AppLayout() {
  const [generatedScript, setGeneratedScript] = React.useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      topic: '',
      contentType: 'Vlog',
      referenceUrl: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setGeneratedScript(null);
    const result = await handleGenerateScript(values);
    if (result.success && result.data) {
      setGeneratedScript(result.data.script);
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

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex h-full w-full"
          >
            <Sidebar className="w-[320px] border-r border-sidebar-border">
              <SidebarHeader className="p-4">
                <Logo />
              </SidebarHeader>
              <SidebarContent className="p-0">
                <SidebarGroup className="py-4">
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

                <SidebarGroup className="py-4">
                  <SidebarGroupLabel className="px-4 font-semibold text-sidebar-foreground/80">
                    Why TubeScript AI?
                  </SidebarGroupLabel>
                  <div className="flex flex-col gap-2 mt-2 px-4">
                      <div className="flex items-center gap-2 text-sm text-sidebar-foreground/80">
                        <Video className="size-4" /> Match any creator&apos;s style
                      </div>
                      <div className="flex items-center gap-2 text-sm text-sidebar-foreground/80">
                        <Globe className="size-4" /> Support for multiple
                        platforms
                      </div>
                      <div className="flex items-center gap-2 text-sm text-sidebar-foreground/80">
                        <Info className="size-4" /> AI-powered suggestions
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

            <main className="flex-1 flex flex-col bg-background h-full overflow-y-auto">
              <div className="flex flex-col gap-8 max-w-2xl mx-auto w-full p-8 md:p-12">
                <header>
                  <h1 className="text-4xl font-headline font-bold">
                    Create Your Script
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Start with your idea, enhance with AI, match any style
                  </p>
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
              </div>

              <div className="flex-1 flex flex-col p-8 md:p-12 pt-0">
                {isLoading && !generatedScript ? (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <p className="text-muted-foreground">
                      Generating your script...
                    </p>
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-12 w-full" />
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
            </main>
          </form>
        </Form>
      </div>
    </div>
  );
}
