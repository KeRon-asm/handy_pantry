"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Volume2 } from "lucide-react"
import { toast } from "sonner"

interface VoiceCommandsDemoProps {
  userId: string
}

export function VoiceCommandsDemo({ userId }: VoiceCommandsDemoProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [lastCommand, setLastCommand] = useState("")

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast.error("Voice recognition not supported in this browser")
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "en-US"

    recognition.onstart = () => {
      setIsListening(true)
      setTranscript("")
    }

    recognition.onresult = async (event: any) => {
      const spokenText = event.results[0][0].transcript
      setTranscript(spokenText)
      setLastCommand(spokenText)

      // Process the command
      await processVoiceCommand(spokenText)
    }

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error)
      toast.error("Could not recognize speech. Please try again.")
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const processVoiceCommand = async (command: string) => {
    const lowerCommand = command.toLowerCase()

    try {
      const response = await fetch("/api/voice-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: lowerCommand, userId }),
      })

      if (!response.ok) {
        throw new Error("Failed to process command")
      }

      const result = await response.json()

      if (result.success) {
        toast.success(result.message)

        // Optional: Speak the response
        if ("speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(result.message)
          window.speechSynthesis.speak(utterance)
        }
      } else {
        toast.error(result.message || "Command not recognized")
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to process voice command")
    }
  }

  const stopListening = () => {
    setIsListening(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Voice Commands
        </CardTitle>
        <p className="text-sm text-muted-foreground">Control your pantry hands-free with voice commands</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center">
          <Button
            size="lg"
            variant={isListening ? "destructive" : "default"}
            onClick={isListening ? stopListening : startListening}
            className="h-24 w-24 rounded-full"
          >
            {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
          </Button>
        </div>

        {isListening && (
          <div className="text-center">
            <Badge variant="secondary" className="animate-pulse">
              Listening...
            </Badge>
          </div>
        )}

        {transcript && (
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">You said:</p>
            <p className="font-medium">{transcript}</p>
          </div>
        )}

        {lastCommand && (
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Last command:</p>
            <p className="font-medium">{lastCommand}</p>
          </div>
        )}

        <div className="space-y-3">
          <h4 className="font-medium">Example Commands:</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">•</span>
              <span>"Add 2 pounds of chicken to my pantry"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">•</span>
              <span>"What's expiring soon?"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">•</span>
              <span>"Add milk to my shopping list"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">•</span>
              <span>"Suggest a recipe with pasta"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">•</span>
              <span>"How much have I spent this month?"</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
