"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { MapPin, Car, Navigation } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function LocationPreferences() {
  const [loading, setLoading] = useState(false)
  const [drivingPreference, setDrivingPreference] = useState<"no_drive" | "flexible">("flexible")
  const [maxDistance, setMaxDistance] = useState(10)
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [zipCode, setZipCode] = useState("")
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadPreferences()
  }, [])

  async function loadPreferences() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from("profiles")
      .select("driving_preference, max_driving_distance_miles, location_city, location_state, location_zip_code")
      .eq("id", user.id)
      .single()

    if (profile) {
      setDrivingPreference(profile.driving_preference || "flexible")
      setMaxDistance(profile.max_driving_distance_miles || 10)
      setCity(profile.location_city || "")
      setState(profile.location_state || "")
      setZipCode(profile.location_zip_code || "")
    }
  }

  async function detectLocation() {
    setLoading(true)
    try {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords

            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
              )
              const data = await response.json()

              if (data.address) {
                setCity(data.address.city || data.address.town || data.address.village || "")
                setState(data.address.state || "")
                setZipCode(data.address.postcode || "")
              }

              toast({
                title: "Location detected",
                description: `Found: ${data.display_name.split(",")[0]}`,
              })
            } catch (geoError) {
              toast({
                title: "Location detected",
                description: `Coordinates saved. Please enter city/state manually.`,
              })
            }

            const {
              data: { user },
            } = await supabase.auth.getUser()
            if (user) {
              await supabase
                .from("profiles")
                .update({
                  location_latitude: latitude,
                  location_longitude: longitude,
                })
                .eq("id", user.id)
            }

            setLoading(false)
          },
          (error) => {
            toast({
              title: "Location error",
              description: "Please enable location services or enter your ZIP code manually",
              variant: "destructive",
            })
            setLoading(false)
          },
        )
      } else {
        toast({
          title: "Location not supported",
          description: "Please enter your ZIP code manually",
          variant: "destructive",
        })
        setLoading(false)
      }
    } catch (error) {
      console.error("[v0] Location detection error:", error)
      setLoading(false)
    }
  }

  async function savePreferences() {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      let latitude = null
      let longitude = null

      if (zipCode && zipCode.length === 5) {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&postalcode=${zipCode}&country=USA&limit=1`,
          )
          const data = await response.json()
          if (data && data.length > 0) {
            latitude = Number.parseFloat(data[0].lat)
            longitude = Number.parseFloat(data[0].lon)
          }
        } catch (error) {
          console.error("[v0] Geocoding error:", error)
        }
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          driving_preference: drivingPreference,
          max_driving_distance_miles: maxDistance,
          location_city: city,
          location_state: state,
          location_zip_code: zipCode,
          ...(latitude && longitude ? { location_latitude: latitude, location_longitude: longitude } : {}),
        })
        .eq("id", user.id)

      if (error) throw error

      toast({
        title: "Preferences saved",
        description: "Your location and driving preferences have been updated",
      })
    } catch (error) {
      console.error("[v0] Save preferences error:", error)
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location & Shopping Preferences
        </CardTitle>
        <CardDescription>Set your location and driving preferences to find the best prices near you</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Location */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Your Location</Label>
            <Button variant="outline" size="sm" onClick={detectLocation} disabled={loading}>
              <Navigation className="h-4 w-4 mr-2" />
              Detect Location
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Springfield" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="IL"
                maxLength={2}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zipCode">ZIP Code</Label>
            <Input
              id="zipCode"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="62701"
              maxLength={5}
            />
          </div>
        </div>

        {/* Driving Preference */}
        <div className="space-y-4">
          <Label>Driving Preference</Label>
          <RadioGroup value={drivingPreference} onValueChange={(value: any) => setDrivingPreference(value)}>
            <div className="flex items-start space-x-3 space-y-0">
              <RadioGroupItem value="no_drive" id="no_drive" />
              <div className="space-y-1">
                <Label htmlFor="no_drive" className="font-medium cursor-pointer">
                  I can't drive
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show me only nearby stores within walking/transit distance
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 space-y-0">
              <RadioGroupItem value="flexible" id="flexible" />
              <div className="space-y-1">
                <Label htmlFor="flexible" className="font-medium cursor-pointer">
                  I don't mind driving around
                </Label>
                <p className="text-sm text-muted-foreground">I'm willing to drive further to get better prices</p>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Max Distance (only show if flexible) */}
        {drivingPreference === "flexible" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="maxDistance" className="flex items-center gap-2">
                <Car className="h-4 w-4" />
                Maximum Driving Distance
              </Label>
              <span className="text-sm font-medium">{maxDistance} miles</span>
            </div>
            <Slider
              id="maxDistance"
              value={[maxDistance]}
              onValueChange={(values) => setMaxDistance(values[0])}
              min={1}
              max={50}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">Adjust how far you're willing to drive for better prices</p>
          </div>
        )}

        <Button onClick={savePreferences} disabled={loading} className="w-full">
          Save Preferences
        </Button>
      </CardContent>
    </Card>
  )
}
