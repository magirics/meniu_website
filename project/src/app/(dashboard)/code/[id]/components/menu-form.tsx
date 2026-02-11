"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowUp,
  ArrowUpIcon,
  CalendarIcon,
  CircleX,
  Clock,
  Download,
  FileBraces,
  FileCode,
  FileImage,
  FileType,
  ListTodo,
  Plus,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Separator } from "@/components/ui/separator"
import QRCode from "react-qr-code"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const timeSlots = []
for (let t = 0; t < 24; t++) {
  timeSlots.unshift(`${t}:00`.padStart(5, "0"))
}

const userFormSchema = z.object({
  name: z.string(),
  description: z.string(),
})

type UserFormValues = z.infer<typeof userFormSchema>

export default function MenuForm({ id }) {
  const svgRef = useRef(null)
  const [imgSrc, setImgSrc] = useState("")

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  const [fromValue, setFromValue] = useState({
    date: new Date(),
    time: "00:00",
  })
  const [untilValue, setUntilValue] = useState({
    date: new Date(),
    time: "00:00",
  })

  useEffect(() => {
    if (!svgRef.current) return

    const svg = svgRef.current
    const serializer = new XMLSerializer()
    const str = serializer.serializeToString(svg)

    const encoded = window.btoa(unescape(encodeURIComponent(str)))
    setImgSrc(`data:image/svg+xml;base64,${encoded}`)
  }, [])

  function onSubmit(data: UserFormValues) {
    function formatTime(value) {
      let datetime = new Date(value.date)
      let [textHour, textMinute] = value.time.split(":")

      const hour = Number.parseInt(textHour)
      const minute = Number.parseInt(textMinute)
      datetime.setHours(hour, minute, 0)
      return datetime.toISOString()
    }

    const item = {
      ...data,
      schedule: {
        start: formatTime(fromValue),
        end: formatTime(untilValue),
      },
    }

    const response = fetch(`/api/menus/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "applicacion/json",
      },
      body: JSON.stringify({ item }),
    })
  }

  const stats = {
    total: 0,
    completed: 0,
  }
  const [menu, setMenu] = useState(null)
  async function getMenu() {
    const response = await fetch(`/api/menus/${id}`)
    const data = await response.json()
    setMenu(data.item)
  }

  useEffect(() => {
    getMenu()
  }, [id])

  const onDelete = async (file) => {
    const key = encodeURIComponent(file.key)
    const response = await fetch(`/api/files/${key}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    })
    console.log(response)
    alert(`${file.name} deleted!`)
  }

  return (
    <div className="flex gap-4 px-4 py-4 lg:px-6 lg:py-6">
      {menu && menu.files.map((file) => (
        <div key={file.key} className="inline-block text-sm relative group">
          <CircleX
            onClick={() => onDelete(file)}
            className="h-6 w-6 absolute stroke-1 right-0 to-0 translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100"
          />
          <FileType className="h-8 w-8 stroke-1 m-auto" />
          <span className="max-w-16 truncate inline-block" title={file.name}>
            {file.name}
          </span>
        </div>
      ))}

      {/* {files.images.map((file) => (
        <div className="inline-block">
          <FileImage className="h-8 w-8 stroke-1 m-auto" />
          {file.name}
        </div>
      ))}

      {files.scripts.map((file) => (
        <div className="inline-block">
          <FileCode className="h-8 w-8 stroke-1 m-auto" />
          {file.name}
        </div>
      ))} */}

      {/* <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Total Tasks
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold">{stats.total}</span>
                <span className="flex items-center gap-0.5 text-sm text-green-500">
                  <ArrowUp className="size-3.5" />
                  {stats.total > 0
                    ? Math.round((stats.completed / stats.total) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
            <div className="bg-secondary rounded-lg p-3">
              <ListTodo className="size-6" />
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  )
}

function Schedule({ value, setValue }) {
  const [showCalendar, setShowCalendar] = useState(false)

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4" />
          Until
        </Label>
        <Popover open={showCalendar} onOpenChange={setShowCalendar}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              {format(value.date, "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value.date}
              onSelect={(date) => {
                if (date) {
                  setValue((prev) => ({ ...prev, date }))
                  setShowCalendar(false)
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Time
        </Label>
        <Select
          value={value.time}
          onValueChange={(value) =>
            setValue((prev) => ({ ...prev, time: value }))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timeSlots.map((time) => (
              <SelectItem key={time} value={time}>
                {time}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
