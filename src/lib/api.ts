import type { BloodGroup, UrgencyLevel } from "@/types"

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1"

class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  try {
    const response = await fetch(url, { ...options, headers })
    if (!response.ok) {
      let errorMsg = `API Error: ${response.status} ${response.statusText}`
      try {
        const errorData = await response.json()
        if (Array.isArray(errorData.detail)) {
          errorMsg = errorData.detail
            .map((d: any) => {
              const field = d.loc && d.loc.length > 0 ? d.loc[d.loc.length - 1] : ""
              return field ? `${field}: ${d.msg}` : d.msg
            })
            .join(". ")
        } else if (typeof errorData.detail === "string") {
          errorMsg = errorData.detail
        } else if (errorData.message) {
          errorMsg = errorData.message
        }
      } catch {
        // use default error message
      }
      throw new ApiError(errorMsg, response.status)
    }
    return (await response.json()) as T
  } catch (err) {
    console.warn(`[BloodBridge API] Request failed for ${endpoint}:`, err)
    throw err
  }
}

export const api = {
  // 1. Authentication
  auth: {
    signup: async (data: { phone: string; password: string; name: string; city?: string }) => {
      return request<{
        access_token: string
        token_type: string
        user: { id: string; phone: string; name: string; city: string }
      }>("/auth/signup", {
        method: "POST",
        body: JSON.stringify(data),
      })
    },

    login: async (data: { phone: string; password: string }) => {
      return request<{
        access_token: string
        token_type: string
        user: { id: string; phone: string; name: string; city: string }
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      })
    },
  },

  // 2. Emergency Blood Requests
  requests: {
    list: async (params?: { city?: string; status?: string; limit?: number }) => {
      const searchParams = new URLSearchParams()
      if (params?.city) searchParams.append("city", params.city)
      if (params?.status) searchParams.append("status", params.status)
      if (params?.limit) searchParams.append("limit", params.limit.toString())

      const query = searchParams.toString() ? `?${searchParams.toString()}` : ""
      return request<
        Array<{
          id: string
          reference_code: string
          blood_group: BloodGroup
          blood_component: string
          units_needed: number
          urgency: UrgencyLevel
          hospital: {
            name: string
            area?: string
            city: string
            latitude: number
            longitude: number
          }
          contact_person: string
          contact_phone: string
          notes?: string
          status: string
          matched_donor_id?: string
          created_at?: string
        }>
      >(`/requests${query}`)
    },

    create: async (data: {
      blood_group: BloodGroup
      blood_component: string
      units_needed: number
      urgency: UrgencyLevel
      hospital_name: string
      hospital_area?: string
      hospital_city: string
      hospital_latitude: number
      hospital_longitude: number
      contact_person: string
      contact_phone: string
      notes?: string
    }) => {
      return request<{
        id: string
        reference_code: string
        blood_group: BloodGroup
        blood_component: string
        units_needed: number
        urgency: UrgencyLevel
        hospital: {
          name: string
          area?: string
          city: string
          latitude: number
          longitude: number
        }
        contact_person: string
        contact_phone: string
        notes?: string
        status: string
      }>("/requests", {
        method: "POST",
        body: JSON.stringify(data),
      })
    },

    updateStatus: async (
      requestId: string,
      status: "searching" | "donor_matched" | "fulfilled" | "cancelled",
      matchedDonorId?: string
    ) => {
      return request<{ id: string; status: string }>(`/requests/${requestId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, matched_donor_id: matchedDonorId }),
      })
    },
  },

  // 3. Standby Donors
  donors: {
    register: async (data: {
      name: string
      phone: string
      blood_group: BloodGroup
      city: string
      area?: string
      latitude: number
      longitude: number
    }) => {
      return request<{
        id: string
        name: string
        phone: string
        blood_group: string
        city: string
        is_available: boolean
      }>("/donors", {
        method: "POST",
        body: JSON.stringify(data),
      })
    },

    match: async (params: {
      blood_group: string
      lat: number
      lng: number
      city?: string
      radius_km?: number
    }) => {
      const searchParams = new URLSearchParams({
        blood_group: params.blood_group,
        lat: params.lat.toString(),
        lng: params.lng.toString(),
        city: params.city || "Karachi",
        radius_km: (params.radius_km || 30).toString(),
      })
      return request<
        Array<{
          id: string
          name: string
          phone: string
          blood_group: string
          city: string
          area?: string
          latitude: number
          longitude: number
          is_available: boolean
          total_donations: number
          distance_km?: number
          eta_mins?: number
        }>
      >(`/donors/match?${searchParams.toString()}`)
    },
  },

  // 4. Hospital Blood Banks
  bloodBanks: {
    getNearest: async (params?: { lat?: number; lng?: number; city?: string }) => {
      const searchParams = new URLSearchParams()
      if (params?.lat !== undefined) searchParams.append("lat", params.lat.toString())
      if (params?.lng !== undefined) searchParams.append("lng", params.lng.toString())
      if (params?.city) searchParams.append("city", params.city)

      const query = searchParams.toString() ? `?${searchParams.toString()}` : ""
      return request<
        Array<{
          id: string
          name: string
          city: string
          area: string
          province: string
          phone: string
          hours: string
          latitude: number
          longitude: number
          services: string[]
          distance_km?: number
        }>
      >(`/blood-banks${query}`)
    },
  },

  // 5. WhatsApp Simulation & Webhooks
  whatsapp: {
    getDispatchStatus: async (requestId: string) => {
      return request<{
        request_id: string
        total_dispatched: number
        accepted: boolean
        matched_donor?: any
        dispatches?: any[]
      }>(`/whatsapp/dispatch-status?request_id=${encodeURIComponent(requestId)}`)
    },

    simulateAccept: async (payload: {
      request_id: string
      donor_id?: string
      donor_name?: string
      donor_phone?: string
      blood_group?: string
      location?: string
      distance_km?: number
      eta_mins?: number
    }) => {
      return request<{
        success: boolean
        message: string
        matched_donor: {
          id: string
          name: string
          phone: string
          blood_group: string
          location: string
          distance_km: number
          eta_mins: number
          donations_count: number
        }
      }>("/whatsapp/simulate-accept", {
        method: "POST",
        body: JSON.stringify(payload),
      })
    },
  },
}
