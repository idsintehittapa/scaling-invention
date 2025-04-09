import { useQuery } from "@apollo/client";
import { GET_INCIDENTS } from "../queries/queries";
import { IncidentsData, CalendarValue } from "../types/types";
import "react-calendar-heatmap/dist/styles.css";
import CalendarHeatmap from "react-calendar-heatmap";
import { useRef, useState, useEffect, useMemo } from "react";

import "./calendar.css";

// Custom wrapper component for the calendar
const YearCalendar: React.FC<{ year: number; data: CalendarValue[] }> = ({
  year,
  data,
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const filteredData = useMemo(
    () => data.filter((d) => d.date.startsWith(`${year}`)),
    [data, year]
  );

  useEffect(() => {
    // Fix for January label
    if (wrapperRef.current) {
      // Use a short timeout to ensure the calendar has rendered
      setTimeout(() => {
        const container = wrapperRef.current;
        const svg = container?.querySelector("svg");

        if (svg) {
          // Check if January label exists
          const janLabel = Array.from(
            svg.querySelectorAll(".react-calendar-heatmap-month-label")
          ).find((label) => label.textContent === "Jan");

          if (!janLabel) {
            // Find February label to get positioning reference
            const febLabel = Array.from(
              svg.querySelectorAll(".react-calendar-heatmap-month-label")
            ).find((label) => label.textContent === "Feb");

            if (febLabel) {
              // Create new text element for January
              const newJanLabel = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "text"
              );
              newJanLabel.setAttribute(
                "class",
                "react-calendar-heatmap-month-label"
              );
              newJanLabel.setAttribute(
                "font-size",
                febLabel.getAttribute("font-size") || "10"
              );

              // Position it before February
              const febX = parseFloat(febLabel.getAttribute("x") || "0");
              newJanLabel.setAttribute("x", Math.max(febX - 50, 10).toString());
              newJanLabel.setAttribute("y", febLabel.getAttribute("y") || "0");

              newJanLabel.textContent = "Jan";

              // Insert before the first child to ensure it's behind other elements
              svg.insertBefore(newJanLabel, svg.firstChild);
            }
          }
        }
      }, 200); // Slightly longer timeout to ensure rendering is complete
    }
  }, [year, data]);

  return (
    <div ref={wrapperRef} className="calendar-year-wrapper">
      <CalendarHeatmap
        startDate={new Date(`${year}-01-01`)}
        endDate={new Date(`${year}-12-31`)}
        values={filteredData}
        classForValue={(value) => {
          if (!value || value.count === 0) return "color-empty";

          // Get all incident types for this day
          const incidentTypes: string[] = value.incidents.map(
            (inc: { incident_type: string }) => inc.incident_type
          );

          // Check if we have multiple types
          const uniqueTypes = new Set(incidentTypes);
          const hasMultipleTypes = uniqueTypes.size > 1;

          // Count occurrences of each type
          const typeCount: Record<string, number> = {};
          incidentTypes.forEach((type) => {
            typeCount[type] = (typeCount[type] || 0) + 1;
          });

          // Find the dominant type
          let dominantType = "unknown";
          let maxCount = 0;
          Object.entries(typeCount).forEach(([type, count]) => {
            if (count > maxCount) {
              dominantType = type;
              maxCount = count;
            }
          });

          // Determine intensity level
          let level = 1;
          if (value.count <= 1) level = 1;
          else if (value.count <= 3) level = 2;
          else if (value.count <= 6) level = 3;
          else level = 4;

          // Return class with both dominant type and mixed indicator if needed
          const baseClass = `color-type-${dominantType}-level-${level}`;
          return hasMultipleTypes ? `${baseClass} mixed-types` : baseClass;
        }}
        showMonthLabels={true}
        monthLabels={[
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ]}
      />
    </div>
  );
};

const Calendar: React.FC = () => {
  const { loading, error, data } = useQuery<IncidentsData>(GET_INCIDENTS);
  const [calendarData, setCalendarData] = useState<CalendarValue[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [incidentTypes, setIncidentTypes] = useState<string[]>([]);
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (data && data.violent_crimes) {
      // Group incidents by date
      const incidentsByDate = data.violent_crimes.reduce(
        (acc: Record<string, typeof data.violent_crimes>, incident) => {
          // Extract YYYY-MM-DD from the incident_date
          const date = incident.incident_date.split("T")[0];
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(incident);
          return acc;
        },
        {}
      );

      // Transform to calendar format
      const transformedData = Object.keys(incidentsByDate).map((date) => ({
        date,
        count: incidentsByDate[date].length,
        incidents: incidentsByDate[date].map((incident) => ({
          id: incident.id,
          incident_type: incident.incident_type,
        })),
      }));

      // Extract unique years from data
      const uniqueYears = Array.from(
        new Set(
          transformedData.map((item) => parseInt(item.date.substring(0, 4)))
        )
      ).sort((a, b) => b - a); // Sort descending (newest first)

      // Extract unique incident types
      const uniqueTypes = Array.from(
        new Set(data.violent_crimes.map((incident) => incident.incident_type))
      ).sort();

      setCalendarData(transformedData);
      setYears(uniqueYears);
      setIncidentTypes(uniqueTypes);
    }
  }, [data]);

  if (loading) return <p>Loading incidents...</p>;
  if (error) return <p>Error loading incidents: {error.message}</p>;

  return (
    <section className="calendar-section mw-section">
      <h2>Title</h2>

      {/* Type-based legend */}
      <div className="calendar-legend">
        {incidentTypes.map((type) => (
          <div key={type} className="legend-type">
            <p>{type}</p>
            <div className="legend-intensity">
              <div className="legend-item">
                <div
                  className={`legend-color color-type-${type}-level-1`}
                ></div>
                <span>1 incident</span>
              </div>
              <div className="legend-item">
                <div
                  className={`legend-color color-type-${type}-level-2`}
                ></div>
                <span>2-3 incidents</span>
              </div>
              <div className="legend-item">
                <div
                  className={`legend-color color-type-${type}-level-3`}
                ></div>
                <span>4-6 incidents</span>
              </div>
              <div className="legend-item">
                <div
                  className={`legend-color color-type-${type}-level-4`}
                ></div>
                <span>7+ incidents</span>
              </div>
            </div>
          </div>
        ))}

        {/* Add mixed types legend item */}
        <div className="legend-item">
          <div className="legend-color mixed-types"></div>
          <span>Shooting and explosion on the same day</span>
        </div>
      </div>

      {/* Calendar heatmap */}
      <div className="calendar-container">
        {years.map((year) => (
          <div key={year} className="year-section">
            <h3>{year}</h3>
            <YearCalendar year={year} data={calendarData} />
          </div>
        ))}

        {/* Hidden container for dots that will animate to the map */}
        <div className="dots-container">
          {calendarData.flatMap((day) =>
            day.incidents.map((incident, incidentIndex) => (
              <div
                key={incident.id}
                className={`event-dot event-type-${incident.incident_type}`}
                ref={(el) => {
                  const index = calendarData.indexOf(day) * 10 + incidentIndex;
                  dotsRef.current[index] = el;
                }}
                data-id={incident.id}
                style={{ opacity: 0 }}
              />
            ))
          )}
        </div>
      </div>

      <div className="calendar-stats">
        <p>Total incidents: {data?.violent_crimes.length || 0}</p>
      </div>
    </section>
  );
};

export default Calendar;
