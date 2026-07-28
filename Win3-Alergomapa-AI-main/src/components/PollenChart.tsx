import React, { useMemo } from 'react';
import { AirQualityData } from '../types';
import { useAppContext } from '../store';
import { ALLERGENS } from '../data/allergens';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';
import { cs } from 'date-fns/locale';
import { CalendarDays } from 'lucide-react';

export const PollenChart: React.FC<{ data: AirQualityData }> = ({ data }) => {
  const { trackedAllergens } = useAppContext();

  const chartData = useMemo(() => {
    return data.hourly.time.map((time, index) => {
      const point: any = {
        time: parseISO(time),
        formattedTime: format(parseISO(time), 'd. MMM HH:mm', { locale: cs }),
      };
      
      ALLERGENS.forEach(allergen => {
        point[allergen.id] = data.hourly[allergen.apiField][index] || 0;
      });
      
      return point;
    });
  }, [data]);

  const activeAllergenObjects = ALLERGENS.filter(a => trackedAllergens.includes(a.id));

  if (activeAllergenObjects.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mt-8">
      <div className="flex items-center gap-2 mb-6">
        <CalendarDays className="w-5 h-5 text-indigo-500" />
        <h3 className="text-lg font-semibold text-slate-800">Prognóza na další dny</h3>
      </div>
      
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              {activeAllergenObjects.map(allergen => (
                <linearGradient key={`grad-${allergen.id}`} id={`color-${allergen.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={allergen.color} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={allergen.color} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="formattedTime" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
              minTickGap={50}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
            />
            <Tooltip
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
              labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}
            />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
            
            {activeAllergenObjects.map(allergen => (
              <Area
                key={allergen.id}
                type="monotone"
                name={allergen.name}
                dataKey={allergen.id}
                stroke={allergen.color}
                strokeWidth={3}
                fillOpacity={1}
                fill={`url(#color-${allergen.id})`}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
