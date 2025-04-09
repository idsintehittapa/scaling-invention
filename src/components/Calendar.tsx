import { useQuery } from "@apollo/client";
import { GET_INCIDENTS } from "../queries/queries";
import { IncidentsData, CalendarValue } from "../types/types";
import "react-calendar-heatmap/dist/styles.css";
import CalendarHeatmap from "react-calendar-heatmap";
import { useRef, useState, useEffect } from "react";
import "./calendar.css"; // Create this file for styling

const Calendar: React.FC = () => {
  const { loading, error, data } = useQuery<IncidentsData>(GET_INCIDENTS);
  const [calendarData, setCalendarData] = useState<CalendarValue[]>([]);
  const [years, setYears] = useState<number[]>([]);
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

      setCalendarData(transformedData);
      setYears(uniqueYears);
    }
  }, [data]);

  if (loading) return <p>Loading incidents...</p>;
  if (error) return <p>Error loading incidents: {error.message}</p>;

  return (
    <section className="calendar-section mw-section">
      <h2>Title</h2>

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color color-empty"></div>
          <span>No incidents</span>
        </div>
        <div className="legend-item">
          <div className="legend-color color-scale-1"></div>
          <span>1 incident</span>
        </div>
        <div className="legend-item">
          <div className="legend-color color-scale-2"></div>
          <span>2-3 incidents</span>
        </div>
        <div className="legend-item">
          <div className="legend-color color-scale-3"></div>
          <span>4-6 incidents</span>
        </div>
        <div className="legend-item">
          <div className="legend-color color-scale-4"></div>
          <span>7+ incidents</span>
        </div>
      </div>

      {/* Calendar heatmap */}
      <div className="calendar-container">
        {years.map((year) => (
          <div key={year} className="year-section">
            <h3>{year}</h3>
            <CalendarHeatmap
              startDate={new Date(`${year}-01-01`)}
              endDate={new Date(`${year}-12-31`)}
              values={calendarData.filter((d) => d.date.startsWith(`${year}`))}
              classForValue={(value) => {
                if (!value || value.count === 0) return "color-empty";
                if (value.count === 1) return "color-scale-1";
                if (value.count <= 3) return "color-scale-2";
                if (value.count <= 6) return "color-scale-3";
                return "color-scale-4";
              }}
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
