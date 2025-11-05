import { Calendar, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export interface Event {
  id: string;
  title: string;
  date: string;
  type: "upcoming" | "trending";
}

interface EventsRibbonProps {
  events: Event[];
}

export function EventsRibbon({ events }: EventsRibbonProps) {
  return (
    <div className="w-full bg-card border-y">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center h-16 md:h-20 overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-6">
          {events.map((event) => (
            <Link 
              key={event.id} 
              href={`/events/${event.id}`}
              className="flex items-center gap-3 flex-shrink-0 snap-start hover-elevate active-elevate-2 px-4 py-2 rounded-lg transition-all"
              data-testid={`link-event-${event.id}`}
            >
              <div className="flex-shrink-0">
                {event.type === "upcoming" ? (
                  <Calendar className="h-5 w-5 text-primary" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-destructive" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium whitespace-nowrap">
                  {event.title}
                </span>
                <Badge variant="outline" className="text-xs whitespace-nowrap">
                  {event.date}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
