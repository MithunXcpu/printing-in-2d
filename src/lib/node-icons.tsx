import {
  // Data & Storage
  Database, Table2, FolderOpen, FileSpreadsheet, HardDrive, Archive, Server, Boxes,
  // Cloud & Weather
  Cloud, CloudUpload, CloudDownload, CloudRain, CloudSun, Sun, Thermometer, Wind,
  // Communication
  Mail, Send, MessageSquare, Phone, Bell, Megaphone, Radio, Rss,
  // Processing & Logic
  Cog, Settings, Cpu, Filter, Repeat, RefreshCw, Shuffle, SlidersHorizontal,
  // AI & Intelligence
  Brain, Sparkles, Bot, Wand2, Zap, Target, Eye, Lightbulb,
  // Decisions & Flow
  GitBranch, GitMerge, Split, Route, ArrowLeftRight, CircleDot, Scale,
  // Output & Export
  FileOutput, Download, Save, Printer, Image, FileText, FileJson, ClipboardList,
  // Dashboards & Charts
  LayoutDashboard, BarChart, BarChart3, PieChart, LineChart, TrendingUp, Activity, Gauge,
  // APIs & Web
  Globe, Wifi, Link, Webhook, Code, Terminal, Network,
  // Scheduling & Time
  Clock, Timer, Calendar, CalendarClock, AlarmClock, Hourglass,
  // Notifications & Alerts
  BellRing, AlertTriangle, AlertCircle, CheckCircle, Info, ShieldCheck,
  // Users & Collaboration
  User, Users, UserCheck, Contact,
  // Money & Commerce
  DollarSign, CreditCard, ShoppingCart, Receipt,
  // Documents
  FileSearch, FilePlus, Files, BookOpen,
  // Misc
  Box, Layers, Map, MapPin, Compass, Search, Lock, Unlock, Key, Tag, Hash,
  Workflow, Plug, Power, Waypoints,
} from 'lucide-react'
import type { WorkflowNodeType } from './types'

type IconComponent = React.ComponentType<{ size?: number; className?: string }>

// Comprehensive name-to-icon mapping (case-insensitive lookup via getIconByName)
const ICON_BY_NAME: Record<string, IconComponent> = {
  // Data & Storage
  database: Database, table: Table2, table2: Table2, folder: FolderOpen, folderopen: FolderOpen,
  filespreadsheet: FileSpreadsheet, spreadsheet: FileSpreadsheet, excel: FileSpreadsheet,
  harddrive: HardDrive, archive: Archive, server: Server, boxes: Boxes, storage: HardDrive,

  // Cloud & Weather
  cloud: Cloud, cloudupload: CloudUpload, upload: CloudUpload, clouddownload: CloudDownload,
  cloudrain: CloudRain, rain: CloudRain, cloudsun: CloudSun, sun: Sun,
  thermometer: Thermometer, temperature: Thermometer, wind: Wind, weather: CloudSun,

  // Communication
  mail: Mail, email: Mail, send: Send, messagesquare: MessageSquare, message: MessageSquare,
  chat: MessageSquare, phone: Phone, bell: Bell, megaphone: Megaphone, radio: Radio,
  rss: Rss, notification: Bell,

  // Processing & Logic
  cog: Cog, gear: Cog, settings: Settings, cpu: Cpu, processor: Cpu,
  filter: Filter, repeat: Repeat, loop: Repeat, refresh: RefreshCw, refreshcw: RefreshCw,
  shuffle: Shuffle, random: Shuffle, sliders: SlidersHorizontal, slidershorizontal: SlidersHorizontal,
  config: Settings, configure: Settings,

  // AI & Intelligence
  brain: Brain, sparkles: Sparkles, ai: Sparkles, bot: Bot, robot: Bot,
  wand: Wand2, wand2: Wand2, magic: Wand2, zap: Zap, lightning: Zap,
  target: Target, eye: Eye, vision: Eye, lightbulb: Lightbulb, idea: Lightbulb,
  smart: Brain, intelligence: Brain, ml: Brain,

  // Decisions & Flow
  gitbranch: GitBranch, branch: GitBranch, gitmerge: GitMerge, merge: GitMerge,
  split: Split, fork: Split, route: Route, routing: Route,
  arrowleftright: ArrowLeftRight, compare: ArrowLeftRight, comparison: ArrowLeftRight,
  circledot: CircleDot, scale: Scale, balance: Scale,

  // Output & Export
  fileoutput: FileOutput, output: FileOutput, download: Download, export: Download,
  save: Save, printer: Printer, print: Printer, image: Image, photo: Image,
  filetext: FileText, document: FileText, filejson: FileJson, json: FileJson,
  clipboardlist: ClipboardList, clipboard: ClipboardList, report: ClipboardList,

  // Dashboards & Charts
  layoutdashboard: LayoutDashboard, dashboard: LayoutDashboard, barchart: BarChart,
  barchart3: BarChart3, chart: BarChart3, piechart: PieChart, pie: PieChart,
  linechart: LineChart, graph: LineChart, trendingup: TrendingUp, trending: TrendingUp,
  activity: Activity, gauge: Gauge, meter: Gauge, analytics: BarChart3, metrics: Activity,

  // APIs & Web
  globe: Globe, world: Globe, earth: Globe, international: Globe,
  wifi: Wifi, wireless: Wifi, link: Link, url: Link,
  webhook: Webhook, hook: Webhook, code: Code, terminal: Terminal, cli: Terminal,
  network: Network, internet: Globe, web: Globe, api: Webhook,

  // Scheduling & Time
  clock: Clock, time: Clock, timer: Timer, stopwatch: Timer,
  calendar: Calendar, schedule: Calendar, calendarclock: CalendarClock,
  alarm: AlarmClock, hourglass: Hourglass, cron: Clock,

  // Notifications & Alerts
  bellring: BellRing, alert: AlertTriangle, alerttriangle: AlertTriangle,
  alertcircle: AlertCircle, error: AlertCircle, checkcircle: CheckCircle,
  success: CheckCircle, check: CheckCircle, info: Info, shieldcheck: ShieldCheck,
  security: ShieldCheck, warning: AlertTriangle,

  // Users & Collaboration
  user: User, users: Users, team: Users, usercheck: UserCheck, contact: Contact,
  people: Users, person: User,

  // Money & Commerce
  dollarsign: DollarSign, dollar: DollarSign, money: DollarSign, payment: CreditCard,
  creditcard: CreditCard, card: CreditCard, shoppingcart: ShoppingCart, cart: ShoppingCart,
  receipt: Receipt, invoice: Receipt, billing: DollarSign,

  // Documents
  filesearch: FileSearch, filefind: FileSearch, fileplus: FilePlus, newfile: FilePlus,
  files: Files, bookopen: BookOpen, book: BookOpen, docs: BookOpen, documentation: BookOpen,

  // Misc
  box: Box, layers: Layers, layer: Layers, map: Map, mappin: MapPin, location: MapPin,
  compass: Compass, search: Search, find: Search, lock: Lock, unlock: Unlock,
  key: Key, tag: Tag, label: Tag, hash: Hash, hashtag: Hash,
  workflow: Workflow, plug: Plug, connector: Plug, integration: Plug,
  power: Power, waypoints: Waypoints, pipeline: Waypoints,
}

// Type-based fallback icons (used when icon name not found)
const TYPE_ICON_MAP: Record<WorkflowNodeType, IconComponent> = {
  source: Database,
  processor: Cog,
  ai: Sparkles,
  decision: GitBranch,
  output: FileOutput,
  trigger: Zap,
  api: Globe,
  database: Database,
  notification: Bell,
  transform: Shuffle,
  display: LayoutDashboard,
  storage: HardDrive,
}

/** Look up icon by name (case-insensitive). Returns null if not found. */
export function getIconByName(name: string): IconComponent | null {
  if (!name) return null
  const key = name.toLowerCase().replace(/[-_\s]/g, '')
  return ICON_BY_NAME[key] || null
}

/** Get icon for a node: tries icon name first, falls back to type-based icon. */
export function getNodeIcon(type: WorkflowNodeType, size = 16, iconName?: string) {
  const IconByName = iconName ? getIconByName(iconName) : null
  const Icon = IconByName || TYPE_ICON_MAP[type] || Box
  return <Icon size={size} />
}

/** List of available icon names for the system prompt. */
export const AVAILABLE_ICON_NAMES = [
  // Data
  'Database', 'Table2', 'FolderOpen', 'FileSpreadsheet', 'Server', 'HardDrive', 'Archive',
  // Cloud & Weather
  'Cloud', 'CloudUpload', 'CloudDownload', 'CloudRain', 'CloudSun', 'Sun', 'Thermometer', 'Wind',
  // Communication
  'Mail', 'Send', 'MessageSquare', 'Phone', 'Bell', 'Megaphone',
  // Processing
  'Cog', 'Settings', 'Cpu', 'Filter', 'Repeat', 'RefreshCw', 'Shuffle', 'SlidersHorizontal',
  // AI
  'Brain', 'Sparkles', 'Bot', 'Wand2', 'Zap', 'Target', 'Eye', 'Lightbulb',
  // Decisions
  'GitBranch', 'GitMerge', 'Split', 'Route', 'ArrowLeftRight', 'Scale',
  // Output
  'FileOutput', 'Download', 'Save', 'Printer', 'Image', 'FileText', 'ClipboardList',
  // Dashboards
  'LayoutDashboard', 'BarChart', 'BarChart3', 'PieChart', 'LineChart', 'TrendingUp', 'Activity', 'Gauge',
  // APIs & Web
  'Globe', 'Wifi', 'Link', 'Webhook', 'Code', 'Terminal', 'Network',
  // Scheduling
  'Clock', 'Timer', 'Calendar', 'CalendarClock', 'AlarmClock', 'Hourglass',
  // Alerts
  'BellRing', 'AlertTriangle', 'CheckCircle', 'Info', 'ShieldCheck',
  // Users
  'User', 'Users', 'Contact',
  // Money
  'DollarSign', 'CreditCard', 'ShoppingCart', 'Receipt',
  // Documents
  'FileSearch', 'FilePlus', 'Files', 'BookOpen',
  // Misc
  'Box', 'Layers', 'Map', 'MapPin', 'Search', 'Lock', 'Key', 'Tag',
  'Workflow', 'Plug', 'Power', 'Waypoints',
]
