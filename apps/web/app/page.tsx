"use client"
import * as React from "react"
import { Button } from "@everleap/design-system";
import { Input } from "@everleap/design-system";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@everleap/design-system";
import { Checkbox } from "@everleap/design-system";
import { RadioGroup, RadioGroupItem } from "@everleap/design-system";
import { Switch } from "@everleap/design-system";
import { Slider } from "@everleap/design-system";
import { Textarea } from "@everleap/design-system";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@everleap/design-system";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@everleap/design-system";
import { Avatar, AvatarFallback, AvatarImage } from "@everleap/design-system";
import { Badge } from "@everleap/design-system";
import { Separator } from "@everleap/design-system";
import { Skeleton } from "@everleap/design-system";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@everleap/design-system";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@everleap/design-system";
import { Popover, PopoverContent, PopoverTrigger } from "@everleap/design-system";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@everleap/design-system";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@everleap/design-system";
import { Progress } from "@everleap/design-system";
import { Toaster } from "@everleap/design-system";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@everleap/design-system";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@everleap/design-system";
import { Alert, AlertTitle, AlertDescription } from "@everleap/design-system";
import { Calendar } from "@everleap/design-system";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@everleap/design-system";

import { CalendarIcon, Bell, Check, Menu, Search, Terminal, Moon, Sun, ShieldCheck } from "lucide-react";
import { useTheme } from "next-themes";
import { EverleapLogo } from "@everleap/design-system";

export default function Home() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-20">
      <div className="border-b bg-card/60 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto max-w-5xl py-3 px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <EverleapLogo />
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-9 h-9"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span className="sr-only">Toggle theme</span>
              </Button>
            )}
            <Button size="sm" variant="outline" className="hidden sm:inline-flex" onClick={() => toast.success("Event has been created")}>Test Toast</Button>
            <Button size="sm">Get Started</Button>
          </div>
        </div>
      </div>

      <main className="container mx-auto max-w-5xl py-8 px-4 space-y-16">

        {/* Layout & Typography */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b/20 pb-2">
            <Badge variant="outline">1.0</Badge>
            <h2 className="text-xl font-semibold">Foundations</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Typography</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1"><p className="text-sm text-muted-foreground">H1 - Bold 32px</p><h1 className="text-3xl font-bold">The quick brown fox</h1></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">H2 - Semibold 24px</p><h2 className="text-2xl font-semibold">Jumps over the lazy dog</h2></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">H3 - Semibold 20px</p><h3 className="text-xl font-semibold">Product Design System</h3></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">Body - Regular 16px</p><p className="leading-7">Consistency is key in design systems.</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">Small - Medium 14px</p><small className="text-sm font-medium leading-none">Metadata and captions</small></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Colors & Radius</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-5 gap-2 text-center text-[10px] text-white">
                  <div className="bg-primary h-12 rounded-md flex items-center justify-center">Primary</div>
                  <div className="bg-secondary text-secondary-foreground h-12 rounded-md flex items-center justify-center">Secondary</div>
                  <div className="bg-destructive h-12 rounded-md flex items-center justify-center">Destruct</div>
                  <div className="bg-muted text-muted-foreground h-12 rounded-md flex items-center justify-center">Muted</div>
                  <div className="bg-accent text-accent-foreground h-12 rounded-md flex items-center justify-center">Accent</div>
                </div>
                <div className="space-y-2 pt-4">
                  <div className="flex items-center justify-between text-sm"><span>Corner Radius</span> <span className="font-mono text-muted-foreground">6px (md)</span></div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-primary rounded-sm"></div>
                    <div className="w-12 h-12 bg-primary rounded-md"></div>
                    <div className="w-12 h-12 bg-primary rounded-lg"></div>
                    <div className="w-12 h-12 bg-primary rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Form Components */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b/20 pb-2">
            <Badge variant="outline">2.0</Badge>
            <h2 className="text-xl font-semibold">Interactive Inputs</h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground mb-4">Text Inputs</h3>
              <div className="grid gap-4">
                <Input placeholder="Default Input" />
                <Input type="password" placeholder="Password" />
                <Textarea placeholder="Type your message here." />
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search..." className="pl-8" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground mb-4">Selection Controls</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="airplane-mode" />
                  <label htmlFor="airplane-mode" className="text-sm font-medium">Airplane Mode</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <label htmlFor="terms" className="text-sm font-medium">Accept terms</label>
                </div>
                <RadioGroup defaultValue="comfortable">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="default" id="r1" />
                    <label htmlFor="r1" className="text-sm">Default</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="comfortable" id="r2" />
                    <label htmlFor="r2" className="text-sm">Comfortable</label>
                  </div>
                </RadioGroup>
                <div className="pt-2">
                  <Slider defaultValue={[33]} max={100} step={1} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground mb-4">Pickers</h3>
              <div className="space-y-4">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="est">Eastern Standard Time (EST)</SelectItem>
                    <SelectItem value="cst">Central Standard Time (CST)</SelectItem>
                    <SelectItem value="mst">Mountain Standard Time (MST)</SelectItem>
                    <SelectItem value="pst">Pacific Standard Time (PST)</SelectItem>
                    <SelectItem value="akst">Alaska Standard Time (AKST)</SelectItem>
                    <SelectItem value="hst">Hawaii Standard Time (HST)</SelectItem>
                  </SelectContent>
                </Select>

                <div className="rounded-md p-4 flex justify-center bg-card">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border shadow"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feedback & Overlays */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b/20 pb-2">
            <Badge variant="outline">3.0</Badge>
            <h2 className="text-xl font-semibold">Feedback & Overlays</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>
                  You can add components to your app using the cli.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Downloading...</span>
                  <span className="text-muted-foreground">45%</span>
                </div>
                <Progress value={45} />
              </div>

              <div className="flex gap-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon"><Bell className="h-4 w-4" /></Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Notifications</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">Open Popover</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">Dimensions</h4>
                        <p className="text-sm text-muted-foreground">
                          Set the dimensions for the layer.
                        </p>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Open Dialog</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Edit profile</DialogTitle>
                      <DialogDescription>
                        Make changes to your profile here. Click save when you're done.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="name" className="text-right text-sm">Name</label>
                        <Input id="name" defaultValue="Pedro Duarte" className="col-span-3" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Save changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="space-y-6">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Data Display</CardTitle>
                  <CardDescription>Complex lists and tables</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Invoice</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">INV001</TableCell>
                        <TableCell><Badge>Paid</Badge></TableCell>
                        <TableCell className="text-right">$250.00</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">INV002</TableCell>
                        <TableCell><Badge variant="secondary">Pending</Badge></TableCell>
                        <TableCell className="text-right">$150.00</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">INV003</TableCell>
                        <TableCell><Badge variant="destructive">Overdue</Badge></TableCell>
                        <TableCell className="text-right">$350.00</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b/20 pb-2">
            <Badge variant="outline">4.0</Badge>
            <h2 className="text-xl font-semibold">Navigation & Structure</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Tabs defaultValue="account" className="w-[400px]">
                <TabsList>
                  <TabsTrigger value="account">Account</TabsTrigger>
                  <TabsTrigger value="password">Password</TabsTrigger>
                </TabsList>
                <TabsContent value="account"><div className="p-4 rounded-md bg-muted/20">Make changes to your account here.</div></TabsContent>
                <TabsContent value="password"><div className="p-4 rounded-md bg-muted/20">Change your password here.</div></TabsContent>
              </Tabs>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Is it accessible?</AccordionTrigger>
                  <AccordionContent>
                    Yes. It adheres to the WAI-ARIA design pattern.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Is it styled?</AccordionTrigger>
                  <AccordionContent>
                    Yes. It comes with default styles that matches the other components' aesthetic.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-md bg-muted/20">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold">shadcn</h4>
                  <p className="text-xs text-muted-foreground">m@example.com</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon"><Menu className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Billing</DropdownMenuItem>
                    <DropdownMenuItem>Team</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">Log out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center gap-4">
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button variant="outline">Open Drawer (Mobile)</Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <div className="mx-auto w-full max-w-sm">
                      <DrawerHeader>
                        <DrawerTitle>Move Goal</DrawerTitle>
                        <DrawerDescription>Set your daily activity goal.</DrawerDescription>
                      </DrawerHeader>
                      <div className="p-4 pb-0">
                        <div className="flex items-center justify-center space-x-2">
                          <Button variant="outline" size="icon" className="h-8 w-8 shrink-0 rounded-full" onClick={() => console.log("decrease")}>
                            <div className="h-4 w-4" >-</div>
                          </Button>
                          <div className="flex-1 text-center">
                            <div className="text-7xl font-bold tracking-tighter">350</div>
                            <div className="text-[0.70rem] uppercase text-muted-foreground">Calories/day</div>
                          </div>
                          <Button variant="outline" size="icon" className="h-8 w-8 shrink-0 rounded-full" onClick={() => console.log("increase")}>
                            <div className="h-4 w-4" >+</div>
                          </Button>
                        </div>
                      </div>
                      <DrawerFooter>
                        <Button>Submit</Button>
                        <DrawerClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </div>
                  </DrawerContent>
                </Drawer>
              </div>
            </div>
          </div>
        </section>

        {/* Design System Checklist */}
        <section className="space-y-6 pt-8">
          <Card className="overflow-hidden">
            <CardHeader className="bg-primary/5 border-b">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <CardTitle>Design System Checklist</CardTitle>
              </div>
              <CardDescription>Final validation of project standards and consistency</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { label: "Typography defined", checked: true },
                  { label: "Colors defined", checked: true },
                  { label: "Spacing scale", checked: true },
                  { label: "Border/radius consistent", checked: true },
                  { label: "Inputs validated", checked: true },
                  { label: "Buttons have all states", checked: true },
                  { label: "Modals & overlays consistent", checked: true },
                  { label: "Tables responsive", checked: true },
                  { label: "Accessibility pass (basic)", checked: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-3 p-3 rounded-md bg-muted/30 transition-colors hover:bg-muted/50">
                    <Checkbox id={`check-${i}`} checked={item.checked} />
                    <label
                      htmlFor={`check-${i}`}
                      className="text-sm font-medium leading-none cursor-pointer flex-1"
                    >
                      {item.label} {item.checked && "✅"}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

      </main>
      <Toaster />
    </div>
  );
}
