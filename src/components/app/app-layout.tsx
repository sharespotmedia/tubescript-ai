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
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarSeparator,
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
    <div className="h-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex h-full w-full"
        >
          <Sidebar className="w-[320px] bg-background border-r border-border">
            <SidebarHeader className="p-4">
              <Logo />
            </SidebarHeader>
            <SidebarContent className="gap-4">
              <SidebarGroup>
                <SidebarGroupLabel className="font-semibold text-foreground/80">
                  Select Content Type
                </SidebarGroupLabel>
                <FormField
                  control={form.control}
                  name="contentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="grid grid-cols-2 gap-2">
                          {contentTypes.map(({ id, icon: Icon }) => (
                            <Button
                              key={id}
                              variant={
                                field.value === id ? 'secondary' : 'ghost'
                              }
                              onClick={() => field.onChange(id)}
                              className={
                                field.value === id
                                  ? 'bg-primary text-primary-foreground'
                                  : 'text-foreground/80 hover:bg-accent hover:text-accent-foreground'
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

              <SidebarGroup>
                <SidebarGroupLabel className="font-semibold text-foreground/80">
                  Why TubeScript AI?
                </SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <div className="flex items-center gap-2 text-sm text-foreground/80">
                      <Video className="size-4" /> Match any creator&apos;s style
                    </div>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <div className="flex items-center gap-2 text-sm text-foreground/80">
                      <Globe className="size-4" /> Support for multiple
                      platforms
                    </div>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <div className="flex items-center gap-2 text-sm text-foreground/80">
                      <Info className="size-4" /> AI-powered suggestions
                    </div>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
              <Card className="bg-muted border-border text-foreground">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Lightbulb className="text-yellow-400" />
                    Pro Tip
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/80">
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
                <div className="flex-1 flex items-center justify-center">
                  <div className="space-y-4 text-center">
                    <p className="text-muted-foreground">
                      Generating your script...
                    </p>
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                </div>
              ) : generatedScript ? (
                <Card className="flex-1 bg-secondary border-border">
                  <CardContent className="p-4 h-full">
                    <pre className="text-sm whitespace-pre-wrap font-sans h-full overflow-auto">
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
  );
}
