"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, Clock, Star, Heart, Sparkles, Palette, X } from "lucide-react"

const services = [
  {
    id: 1,
    title: "Semipermanente + refuerzo",
    price: "desde €15",
    duration: "1:15 hs. aprox.",
    image: "/semipermanent-strengthening-manicure.png",
    description:
      "Manicura semipermanente con tratamiento de refuerzo que fortalece las uñas naturales. Incluye limado, cutículas, base fortalecedora y esmaltado semipermanente de larga duración.",
    features: ["Duración 2-3 semanas", "Fortalece uñas débiles", "Acabado brillante", "Secado inmediato"],
    icon: Sparkles,
    popular: true,
  },
  {
    id: 2,
    title: "Uñas de gel X-press",
    price: "desde €25",
    duration: "1:30 hs. aprox.",
    image: "/placeholder-s6nah.png",
    description:
      "Extensión rápida con tips de gel preformados. Técnica innovadora que reduce el tiempo de aplicación manteniendo la máxima calidad y durabilidad.",
    features: ["Aplicación rápida", "Forma perfecta", "Resistente y flexible", "Ideal para eventos"],
    icon: Star,
  },
  {
    id: 3,
    title: "Uñas de Acrígel",
    price: "desde €30",
    duration: "2:00 hs. aprox.",
    image: "/elegant-acrylic-gel-nails.png",
    description:
      "Combinación perfecta entre acrílico y gel. Ofrece la resistencia del acrílico con la flexibilidad y brillo natural del gel para un resultado excepcional.",
    features: ["Máxima resistencia", "Aspecto natural", "Larga duración", "Personalizable"],
    icon: Heart,
  },
  {
    id: 4,
    title: "Micro extensión",
    price: "desde €20",
    duration: "1:30 hs. aprox.",
    image: "/micro-nail-extension-subtle.png",
    description:
      "Extensión sutil para alargar ligeramente las uñas naturales. Perfecta para quienes buscan un look natural con un poco más de longitud.",
    features: ["Extensión natural", "Ideal para principiantes", "Mantenimiento fácil", "Look discreto"],
    icon: Palette,
  },
  {
    id: 5,
    title: "Relleno",
    price: "desde €18",
    duration: "1:30 hs. aprox.",
    image: "/placeholder-foyt7.png",
    description:
      "Mantenimiento profesional para uñas de gel o acrílico. Incluye limado de crecimiento, reparación de desperfectos y nuevo esmaltado.",
    features: ["Mantiene la forma", "Reparación incluida", "Nuevo color", "Alarga la duración"],
    icon: Star,
  },
  {
    id: 6,
    title: "Retiro",
    price: "desde €5",
    duration: "0:30 hs. aprox.",
    image: "/nail-removal-professional.png",
    description:
      "Retiro profesional y seguro de cualquier tipo de esmaltado o extensión. Incluye hidratación y cuidado posterior de las uñas naturales.",
    features: ["Proceso seguro", "Sin dañar la uña", "Hidratación incluida", "Cuidado posterior"],
    icon: Heart,
  },
  {
    id: 7,
    title: "Semipermanente pies",
    price: "desde €10",
    duration: "1 hs. aprox.",
    image: "/semipermanent-pedicure.png",
    description:
      "Pedicura semipermanente completa con cuidado de cutículas, limado y esmaltado de larga duración especial para pies.",
    features: ["Duración extendida", "Resistente al agua", "Colores vibrantes", "Cuidado completo"],
    icon: Sparkles,
  },
]

export function ServicesPage() {
  const [expandedService, setExpandedService] = useState(null)

  const toggleExpanded = (serviceId) => {
    setExpandedService(expandedService === serviceId ? null : serviceId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-3">Servicios ofrecidos</h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Descubre nuestra amplia gama de servicios profesionales para el cuidado y embellecimiento de tus uñas
            </p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const IconComponent = service.icon
            const isExpanded = expandedService === service.id

            return (
              <Card
                key={service.id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm border-0 shadow-lg relative"
              >
                {/* Service Image */}
                <div className="relative">
                  <img
                    src={service.image || "/placeholder.svg"}
                    alt={service.title}
                    className="w-full h-48 object-cover"
                  />
                  {service.popular && (
                    <Badge className="absolute top-3 right-3 bg-pink-500 hover:bg-pink-600">Popular</Badge>
                  )}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full p-2">
                    <IconComponent className="h-5 w-5 text-pink-600" />
                  </div>
                </div>

                <CardContent className="p-6">
                  {/* Service Header */}
                  <div className="mb-4">
                    <h3 className="font-serif text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-pink-600">{service.price}</span>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Clock className="h-4 w-4 mr-1" />
                        {service.duration}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white">Solicitar cita</Button>
                    <Button
                      variant="outline"
                      className="w-full border-pink-200 text-pink-600 hover:bg-pink-50 bg-transparent"
                      onClick={() => toggleExpanded(service.id)}
                    >
                      {isExpanded ? (
                        <>
                          Menos detalles <ChevronUp className="ml-2 h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Ver detalles <ChevronDown className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>

                {isExpanded && (
                  <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
                    {/* Header del overlay */}
                    <div className="p-4 border-b bg-gradient-to-r from-pink-50 to-purple-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-white rounded-full p-2 shadow-sm">
                            <IconComponent className="h-5 w-5 text-pink-600" />
                          </div>
                          <div>
                            <h3 className="font-serif text-lg font-bold text-gray-900">{service.title}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="font-semibold text-pink-600">{service.price}</span>
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {service.duration}
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedService(null)}
                          className="text-gray-500 hover:text-gray-700 hover:bg-white/50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Contenido del overlay */}
                    <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100%-80px)]">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm">Descripción:</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 text-sm">Incluye:</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {service.features.map((feature, index) => (
                            <div key={index} className="flex items-center text-sm text-gray-600">
                              <div className="w-2 h-2 bg-pink-400 rounded-full mr-3 flex-shrink-0"></div>
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Botones de acción en el overlay */}
                      <div className="pt-4 border-t space-y-2">
                        <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white">Solicitar cita</Button>
                        <Button
                          variant="outline"
                          className="w-full border-pink-200 text-pink-600 hover:bg-pink-50 bg-transparent"
                          onClick={() => setExpandedService(null)}
                        >
                          Cerrar detalles
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </div>

    </div>
  )
}
