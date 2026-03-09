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
import { CalendarIcon, Clock, Download, Plus } from "lucide-react"
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

  async function getMenu() {
    const response = await fetch(`/api/menus/${id}`)
    const data = await response.json()
    const { item } = data

    form.reset(item)
    if (item.schedule) {
      const { start, end } = item.schedule
      const startTime = new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date(start))
      setFromValue({ date: start, time: startTime })

      const endTime = new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date(end))
      setUntilValue({ date: end, time: endTime })
    }
  }

  useEffect(() => {
    getMenu()
  }, [id])

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
      // schedule: {
      //   start: formatTime(fromValue),
      //   end: formatTime(untilValue),
      // },
    }

    const response = fetch(`/api/menus/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "applicacion/json",
      },
      body: JSON.stringify({ item }),
    })
  }

  return (
    <div className="px-4 py-4 lg:px-6 lg:py-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Website Settings</CardTitle>
              <CardDescription>
                Update your website information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Form Fields */}
              <div className="flex flex-col gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter the menu's title"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Bio - Full Width */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter the menu's description..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* <Schedule value={fromValue} setValue={setFromValue} />
              <Schedule value={untilValue} setValue={setUntilValue} /> */}

              {/* Action Buttons */}
              <div className="flex justify-start gap-3">
                <Button type="submit" className="cursor-pointer">
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
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
