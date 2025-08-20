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

const formSchema = z.object({
  topic: z
    .string()
    .min(5, { message: 'Topic must be at least 5 characters.' })
    .max(100, { message: 'Topic must be less than 100 characters.' }),
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full">
        <Sidebar className="w-[320px]">
          <SidebarHeader className="p-4">
            <Logo />
            <p className="text-sm text-primary-foreground/80 mt-2">
              Transform any idea into a professional script, matching the style
              of your favorite content creators.
            </p>
          </SidebarHeader>
          <SidebarContent className="gap-4">
            <SidebarGroup>
              <SidebarGroupLabel className="font-semibold text-primary-foreground/80">
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
                                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                                : 'text-primary-foreground/80 hover:bg-white/20 hover:text-white'
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
              <SidebarGroupLabel className="font-semibold text-primary-foreground/80">
                Why TubeScript AI?
              </SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <div className="flex items-center gap-2 text-sm text-primary-foreground/80">
                    <Video className="size-4" /> Match any creator&apos;s style
                  </div>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <div className="flex items-center gap-2 text-sm text-primary-foreground/80">
                    <Globe className="size-4" /> Support for multiple platforms
                  </div>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <div className="flex items-center gap-2 text-sm text-primary-foreground/80">
                    <Info className="size-4" /> AI-powered suggestions
                  </div>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <Card className="bg-primary-dark/50 border-sidebar-border text-primary-foreground">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lightbulb className="text-yellow-400" />
                  Pro Tip
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-primary-foreground/80">
                  Paste a YouTube URL to perfectly match your favorite
                  creator&apos;s style and tone.
                </p>
              </CardContent>
            </Card>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 flex flex-col p-8 md:p-12 bg-white">
          <div className="flex-1 flex flex-col gap-8 max-w-2xl mx-auto w-full">
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
                       Your Content Idea
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="What's your video about? (e.g., 'Tech review of the latest...')"
                        {...field}
                        className="bg-background"
                      />
                    </FormControl>
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
                        className="bg-background"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex-1 flex flex-col mt-4">
              {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="space-y-4 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">Generating your script...</p>
                  </div>
                </div>
              ) : generatedScript ? (
                <Card className="flex-1">
                  <CardContent className="p-4 h-full">
                     <pre className="text-sm whitespace-pre-wrap font-sans h-full overflow-auto">{generatedScript}</pre>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex-1 flex items-center justify-center rounded-lg border-2 border-dashed bg-background">
                  <div className="text-center text-muted-foreground">
                    <FileText className="mx-auto h-12 w-12" />
                    <p className="mt-4">Your generated script will appear here</p>
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="self-stretch bg-gray-600 hover:bg-gray-700 text-white"
            >
              Generate Script
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </SidebarInset>
      </form>
    </Form>
  );
}
