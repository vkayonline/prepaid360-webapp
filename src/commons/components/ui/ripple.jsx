import React from "react"
import { cn } from "@/commons/lib/utils"

export const Ripple = React.memo(function Ripple(props) {
    const {
        mainCircleSize = 210,
        mainCircleOpacity = 0.24,
        numCircles = 8,
        className,
        ...rest
    } = props

    return (
        <div
            className={cn(
                "pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,white,transparent)] select-none",
                className
            )}
            {...rest}
        >
            {Array.from({ length: numCircles }).map((_, i) => {
                const size = mainCircleSize + i * 70
                const opacity = mainCircleOpacity - i * 0.03
                const animationDelay = `${i * 0.06}s`

                return (
                    <div
                        key={i}
                        className="animate-ripple absolute rounded-full border shadow-xl"
                        style={{
                            width: `${size}px`,
                            height: `${size}px`,
                            opacity,
                            animationDelay,

                            borderColor: "var(--primary)",

                            backgroundColor:
                                "color-mix(in srgb, var(--primary) 18%, transparent)",

                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%) scale(1)",
                        }}
                    />
                )
            })}
        </div>
    )
})

Ripple.displayName = "Ripple"
