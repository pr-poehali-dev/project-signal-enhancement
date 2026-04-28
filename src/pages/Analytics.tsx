import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const STATS_URL = "https://functions.poehali.dev/88bebd8c-af0d-40d6-b881-156036402393";

interface StatsData {
  total: number;
  by_source: { source: string; visits: string }[];
  by_medium: { medium: string; visits: string }[];
  by_campaign: { campaign: string; visits: string }[];
  by_day: { day: string; visits: string }[];
  recent: {
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    utm_term: string | null;
    page_url: string | null;
    ip_address: string | null;
    created_at: string;
  }[];
}

const COLORS = ["#a78bfa", "#7c3aed", "#c4b5fd", "#6d28d9", "#ddd6fe", "#8b5cf6"];

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col gap-1">
      <span className="text-white/50 text-sm">{label}</span>
      <span className="text-white text-2xl font-bold">{value}</span>
    </div>
  );
}

function SimpleBar({ data, nameKey, valueKey }: { data: Record<string, string>[]; nameKey: string; valueKey: string }) {
  if (!data?.length) return <p className="text-white/40 text-sm py-4">Нет данных</p>;
  return (
    <div className="space-y-2 mt-2">
      {data.map((row, i) => {
        const max = parseInt(data[0][valueKey]);
        const val = parseInt(row[valueKey]);
        const pct = Math.round((val / max) * 100);
        return (
          <div key={i} className="flex items-center gap-3">
            <span className="text-white/70 text-sm w-32 truncate shrink-0">{row[nameKey] || "—"}</span>
            <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
              <div className="h-2 rounded-full bg-violet-500" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-white text-sm font-medium w-8 text-right">{val}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(STATS_URL)
      .then((r) => r.json())
      .then((d) => {
        const parsed = typeof d === "string" ? JSON.parse(d) : d;
        setData(parsed);
      })
      .catch(() => setError("Не удалось загрузить данные"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0014] flex items-center justify-center">
      <p className="text-white/50 text-lg animate-pulse">Загрузка аналитики...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#0a0014] flex items-center justify-center">
      <p className="text-red-400">{error}</p>
    </div>
  );

  const dayData = data?.by_day.map((d) => ({ ...d, visits: parseInt(d.visits) })) ?? [];

  return (
    <div className="min-h-screen bg-[#0a0014] text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">

        <div>
          <h1 className="text-3xl font-bold text-white">Аналитика переходов</h1>
          <p className="text-white/50 mt-1">UTM-метки и источники трафика</p>
        </div>

        {/* Итого */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Всего переходов" value={data?.total ?? 0} />
          <StatCard label="Источников" value={data?.by_source.length ?? 0} />
          <StatCard label="Кампаний" value={data?.by_campaign.filter(c => c.campaign !== "—").length ?? 0} />
          <StatCard label="Последние 30 дней" value={dayData.reduce((s, d) => s + d.visits, 0)} />
        </div>

        {/* График по дням */}
        {dayData.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Переходы по дням</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dayData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#1a0a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" }}
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                />
                <Bar dataKey="visits" radius={[4, 4, 0, 0]}>
                  {dayData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Источники / Каналы / Кампании */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-semibold">По источнику</h2>
            <SimpleBar data={data?.by_source as Record<string, string>[]} nameKey="source" valueKey="visits" />
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-semibold">По каналу</h2>
            <SimpleBar data={data?.by_medium as Record<string, string>[]} nameKey="medium" valueKey="visits" />
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-semibold">По кампании</h2>
            <SimpleBar data={data?.by_campaign as Record<string, string>[]} nameKey="campaign" valueKey="visits" />
          </div>
        </div>

        {/* Последние переходы */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Последние переходы</h2>
          {!data?.recent.length ? (
            <p className="text-white/40 text-sm">Переходов пока нет</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white/40 text-left border-b border-white/10">
                    <th className="pb-3 pr-4 font-normal">Дата</th>
                    <th className="pb-3 pr-4 font-normal">Источник</th>
                    <th className="pb-3 pr-4 font-normal">Канал</th>
                    <th className="pb-3 pr-4 font-normal">Кампания</th>
                    <th className="pb-3 pr-4 font-normal">Ключевое слово</th>
                    <th className="pb-3 font-normal">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent.map((row, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-2 pr-4 text-white/60 whitespace-nowrap">{row.created_at}</td>
                      <td className="py-2 pr-4 text-violet-300">{row.utm_source || "—"}</td>
                      <td className="py-2 pr-4 text-white/70">{row.utm_medium || "—"}</td>
                      <td className="py-2 pr-4 text-white/70">{row.utm_campaign || "—"}</td>
                      <td className="py-2 pr-4 text-white/70">{row.utm_term || "—"}</td>
                      <td className="py-2 text-white/40">{row.ip_address || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
