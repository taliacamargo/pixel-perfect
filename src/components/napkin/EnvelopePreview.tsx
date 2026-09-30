import { useId } from "react";
import type { ColorOption } from "@/lib/napkin";

export function EnvelopePreview({ envelope, seal }: { envelope: ColorOption; seal: ColorOption }) {
  const id = useId().replace(/:/g, "");
  const ref = (name: string) => `url(#${id}-${name})`;

  return (
    <figure className="mt-5 flex items-center gap-3">
      <div className="w-28 shrink-0 rounded-xl bg-[radial-gradient(ellipse_at_center,#f8f4ef,#eee7df)] p-1 sm:w-32">
        <svg viewBox="0 0 440 300" className="w-full" aria-hidden="true">
          <defs>
            <linearGradient id={`${id}-paper`} x2="0.3" y2="1">
              <stop stopColor="white" stopOpacity="0.22" />
              <stop offset="0.5" stopColor="white" stopOpacity="0" />
              <stop offset="1" stopColor="#24100d" stopOpacity="0.12" />
            </linearGradient>
            <linearGradient id={`${id}-flap`} x2="0" y2="1">
              <stop stopColor="white" stopOpacity="0.2" />
              <stop offset="1" stopColor="#24100d" stopOpacity="0.09" />
            </linearGradient>
            <radialGradient id={`${id}-wax`} cx="32%" cy="22%" r="80%">
              <stop stopColor="white" stopOpacity="0.8" />
              <stop offset="0.3" stopColor="white" stopOpacity="0.2" />
              <stop offset="0.65" stopColor="white" stopOpacity="0" />
              <stop offset="1" stopColor="#362210" stopOpacity="0.5" />
            </radialGradient>
            <filter id={`${id}-shadow`} x="-20%" y="-30%" width="140%" height="170%">
              <feDropShadow
                dx="0"
                dy="10"
                stdDeviation="8"
                floodColor="#39291c"
                floodOpacity="0.22"
              />
            </filter>
            <filter id={`${id}-crease`} x="-15%" y="-20%" width="130%" height="150%">
              <feDropShadow
                dx="0"
                dy="2"
                stdDeviation="1.4"
                floodColor="#28190e"
                floodOpacity="0.25"
              />
            </filter>
            <filter id={`${id}-grain`}>
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.75"
                numOctaves="3"
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.06" />
              </feComponentTransfer>
              <feBlend in="SourceGraphic" mode="multiply" />
            </filter>
          </defs>
          <g transform="rotate(-4 220 150)">
            <g filter={ref("shadow")}>
              <rect x="36" y="42" width="368" height="224" rx="5" fill={envelope.hex} />
              <rect x="36" y="42" width="368" height="224" rx="5" fill={ref("paper")} />
              <path
                d="M37 45 220 174 403 45V261Q403 266 398 266H42Q37 266 37 261Z"
                fill={envelope.hex}
              />
              <path
                d="m37 45 183 129L403 45M38 263l135-113m229 113L267 150"
                fill="none"
                stroke="#27190f"
                strokeOpacity="0.16"
                strokeWidth="1.2"
              />
              <path d="M38 264 199 129Q220 114 241 129L402 264Z" fill={envelope.hex} />
              <path d="M38 264 199 129Q220 114 241 129L402 264Z" fill={ref("paper")} />
              <path
                d="m38 264 161-135q21-15 42 0l161 135"
                fill="none"
                stroke="white"
                strokeOpacity="0.28"
              />
              <g filter={ref("crease")}>
                <path d="M37 43H403L236 177Q220 190 204 177Z" fill={envelope.hex} />
                <path d="M37 43H403L236 177Q220 190 204 177Z" fill={ref("flap")} />
                <path
                  d="m39 44 166 132q15 12 30 0L401 44"
                  fill="none"
                  stroke="white"
                  strokeOpacity="0.3"
                />
              </g>
              <rect
                x="36"
                y="42"
                width="368"
                height="224"
                rx="5"
                fill="transparent"
                filter={ref("grain")}
              />
            </g>
            <g transform="translate(220 176)" filter={ref("crease")}>
              <path
                d="M-31-12Q-34-27-18-31Q-7-39 5-33Q21-36 29-23Q38-16 33-2Q39 12 27 23Q20 35 6 32Q-8 38-21 29Q-35 24-33 10Q-39-1-31-12Z"
                fill={seal.hex}
              />
              <path
                d="M-31-12Q-34-27-18-31Q-7-39 5-33Q21-36 29-23Q38-16 33-2Q39 12 27 23Q20 35 6 32Q-8 38-21 29Q-35 24-33 10Q-39-1-31-12Z"
                fill={ref("wax")}
              />
              <circle r="25" fill="none" stroke="#48301d" strokeOpacity="0.24" strokeWidth="2.5" />
              <circle cy="1" r="23" fill="none" stroke="white" strokeOpacity="0.45" />
              <path
                d="M0 13C-25-2-13-19 0-8 13-19 25-2 0 13Z"
                fill="none"
                stroke="#48301d"
                strokeOpacity="0.4"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path
                d="M0 14C-25-1-13-18 0-7 13-18 25-1 0 14Z"
                fill="none"
                stroke="white"
                strokeOpacity="0.55"
                strokeWidth="1"
              />
            </g>
          </g>
        </svg>
      </div>
      <figcaption className="text-sm text-muted-foreground">
        Envelope {envelope.label.toLowerCase()} com lacre {seal.label.toLowerCase()}.
      </figcaption>
    </figure>
  );
}
