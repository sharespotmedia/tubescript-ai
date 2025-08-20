'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Copy,
  Download,
  Film,
  Lightbulb,
  Loader2,
  Sparkles,
  Wand2,
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Textarea } from '@/components/ui/textarea';
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
      toast({
        title: 'Script generated successfully!',
        description: 'Your new video script is ready.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: result.error || 'There was a problem generating your script.',
      });
    }
    setIsLoading(false);
  };

  const handleCopy = () => {
    if (generatedScript) {
      navigator.clipboard.writeText(generatedScript);
      toast({ title: 'Script copied to clipboard!' });
    }
  };

  const handleDownload = () => {
    if (generatedScript) {
      const blob = new Blob([generatedScript], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${form.getValues('topic').replace(/\s+/g, '-')}-script.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full">
        <Sidebar>
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <FormField
                control={form.control}
                name="contentType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-primary-foreground font-headline">Content Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1 text-primary-foreground"
                      >
                        {['Vlog', 'Tutorial', 'Commentary', 'Review'].map(
                          (type) => (
                            <FormItem
                              key={type}
                              className="flex items-center space-x-3 space-y-0"
                            >
                              <FormControl>
                                <RadioGroupItem value={type} />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {type}
                              </FormLabel>
                            </FormItem>
                          )
                        )}
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />
            </SidebarGroup>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel className="font-headline">Feature Highlights</SidebarGroupLabel>
              <SidebarMenu>
                 <SidebarMenuItem>
                    <div className="flex items-center gap-2 text-sm text-primary-foreground/80"><Sparkles className="size-4" /> AI-Powered Scripts</div>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <div className="flex items-center gap-2 text-sm text-primary-foreground/80"><Wand2 className="size-4" /> Style Matching</div>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <div className="flex items-center gap-2 text-sm text-primary-foreground/80"><Film className="size-4" /> Customizable Templates</div>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
            <SidebarSeparator />
             <SidebarGroup>
                <SidebarGroupLabel className="font-headline">Script Templates</SidebarGroupLabel>
                 <SidebarMenu>
                     <SidebarMenuItem>
                        <SidebarMenuButton size="sm" disabled>How-to Video</SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton size="sm" disabled>Product Review</SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton size="sm" disabled>Top 5 List</SidebarMenuButton>
                    </SidebarMenuItem>
                 </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <Card className="bg-primary-foreground/10 border-sidebar-border text-primary-foreground">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lightbulb className="text-accent" />
                  Pro Tip
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Use a reference URL from a popular creator in your niche to
                  match their style and tone.
                </p>
              </CardContent>
            </Card>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col p-4 md:p-8">
          <div className="flex-1 flex flex-col gap-8 max-w-4xl mx-auto w-full">
            <header>
              <h1 className="text-4xl font-headline font-bold text-primary">
                Create Your Next Viral Script
              </h1>
              <p className="text-muted-foreground mt-2">
                Just provide a topic and an optional style reference, and let our AI do the heavy lifting.
              </p>
            </header>
            
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-headline">Video Idea</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 'Unboxing the new AI-powered gadget'" {...field} />
                    </FormControl>
                    <FormDescription>
                      Explain not only the main topic but also key ideas to be included within the script.
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
                    <FormLabel className="font-headline">Reference Video</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 'youtube.com/watch?v=...'"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a link to a video whose style you'd like to match.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" size="lg" disabled={isLoading} className="self-start bg-accent hover:bg-accent/90">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Script
                </>
              )}
            </Button>
            
            <Card className="flex-1 flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-headline">Generated Script</CardTitle>
                  <CardDescription>
                    Your AI-generated script will appear below.
                  </CardDescription>
                </div>
                {generatedScript && !isLoading && (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={handleCopy}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleDownload}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="flex-1">
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : (
                  <Textarea
                    readOnly
                    value={
                      generatedScript ||
                      'Your script will appear here once generated. Provide a topic and click "Generate Script" to start.'
                    }
                    className="h-full min-h-[300px] text-base resize-none bg-background"
                    placeholder="Your script will appear here..."
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </form>
    </Form>
  );
}
