import React, { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, ReferenceArea, ReferenceLine } from "recharts";
import { format, subDays } from "date-fns";

interface LpHistoryData {
    takenAt: string;
    lp: number;
    tier: string;
    rank: string;
}

interface LpHistoryChartProps {
    history: LpHistoryData[];
    loading: boolean;
    label: string;
    daysToShow?: number;
    startDate?: Date;
    classes?: string;
}

const RANK_COLORS: Record<string, { color: string; label: string }> = {
    "IRON": { color: "#3E312C", label: "I" },
    "BRONZE": { color: "#785249", label: "B" },
    "SILVER": { color: "#515D66", label: "S" },
    "GOLD": { color: "#6D4A17", label: "G" },
    "PLATINUM": { color: "#0F4B59", label: "P" },
    "EMERALD": { color: "#074E2F", label: "E" },
    "DIAMOND": { color: "#4A6BB5", label: "D" },
    "MASTER": { color: "#701A88", label: "M" },
    "GRANDMASTER": { color: "#9C2E27", label: "GM" },
    "CHALLENGER": { color: "#F4A460", label: "C" },
};

const calculateActualLpChange = (
    firstTier: string,
    firstRank: string,
    firstLp: number,
    lastTier: string,
    lastRank: string,
    lastLp: number
): number => {
    const firstTierUpper = firstTier.toUpperCase();
    const lastTierUpper = lastTier.toUpperCase();
    
    const tierOrder = ["IRON", "BRONZE", "SILVER", "GOLD", "PLATINUM", "EMERALD", "DIAMOND"];
    const divisionOrder = ["IV", "III", "II", "I"];
    const highTiers = ["MASTER", "GRANDMASTER", "CHALLENGER"];
    
    const isFirstHighTier = highTiers.includes(firstTierUpper);
    const isLastHighTier = highTiers.includes(lastTierUpper);
    
    let firstTotalLp: number;
    if (isFirstHighTier) {
        // High tier LP represents LP above Diamond I 100LP threshold
        // Diamond I 100LP = 6*400 + 300 + 100 = 2800 LP equivalent
        // So Master 0LP = 2800 LP equivalent, Master 100LP = 2900 LP equivalent, etc.
        const diamondI100Lp = 6 * 400 + 300 + 100; // 2800
        firstTotalLp = diamondI100Lp + firstLp;
    } else {
        // Regular tiers: tier*400 + division*100 + lp
        const firstTierIndex = tierOrder.indexOf(firstTierUpper);
        const firstDivisionIndex = divisionOrder.indexOf(firstRank.toUpperCase());
        firstTotalLp = firstTierIndex * 400 + (firstDivisionIndex !== -1 ? firstDivisionIndex : 0) * 100 + firstLp;
    }
    
    let lastTotalLp: number;
    if (isLastHighTier) {
        const diamondI100Lp = 6 * 400 + 300 + 100;
        lastTotalLp = diamondI100Lp + lastLp;
    } else {
        const lastTierIndex = tierOrder.indexOf(lastTierUpper);
        const lastDivisionIndex = divisionOrder.indexOf(lastRank.toUpperCase());
        lastTotalLp = lastTierIndex * 400 + (lastDivisionIndex !== -1 ? lastDivisionIndex : 0) * 100 + lastLp;
    }
    
    return lastTotalLp - firstTotalLp;
};

const getEffectiveLp = (tier: string, rank: string, lp: number): number => {
    const tierUpper = tier.toUpperCase();
    
    const tierOrder = ["IRON", "BRONZE", "SILVER", "GOLD", "PLATINUM", "EMERALD", "DIAMOND"];
    const divisionOrder = ["IV", "III", "II", "I"];
    
    const tierIndex = tierOrder.indexOf(tierUpper);
    if (tierIndex !== -1) {
        const divisionIndex = divisionOrder.indexOf(rank.toUpperCase());
        const divisionBase = divisionIndex !== -1 ? divisionIndex * 100 : 0;
        return tierIndex * 400 + divisionBase + lp;
    }
    
    const diamondI100Lp = 6 * 400 + 300 + 100;
    
    if (tierUpper === "MASTER") {
        return diamondI100Lp + lp;
    } else if (tierUpper === "GRANDMASTER") {
        return diamondI100Lp + 1000 + lp;
    } else if (tierUpper === "CHALLENGER") {
        return diamondI100Lp + 2000 + lp;
    }
    
    return lp;
};

const getRankColor = (tier: string): string => {
    const tierUpper = tier.toUpperCase();
    return RANK_COLORS[tierUpper]?.color || "#888888";
};

const getRankLabel = (tier: string): string => {
    const tierUpper = tier.toUpperCase();
    return RANK_COLORS[tierUpper]?.label || tierUpper;
};

const LpHistoryChart: React.FC<LpHistoryChartProps> = ({ 
    history, 
    loading, 
    daysToShow,
    startDate,
    classes = ""
}) => {
    const { chartData, lpChange, minLp, maxLp } = useMemo(() => {
        if (!history || history.length === 0) {
            return { chartData: [], lpChange: 0, minLp: 0, maxLp: 1000, timeMarkers: [] };
        }

        const now = new Date();
        const start = startDate || (daysToShow ? subDays(now, daysToShow) : new Date(history[0].takenAt));
        const end = now;

        const processed = history
            .filter(h => {
                const takenAt = new Date(h.takenAt);
                return takenAt >= start && takenAt <= end;
            })
            .map(h => ({
                ...h,
                date: new Date(h.takenAt),
                effectiveLp: getEffectiveLp(h.tier, h.rank, h.lp),
                color: getRankColor(h.tier),
            }))
            .sort((a, b) => a.date.getTime() - b.date.getTime());

        if (processed.length === 0) {
            return { chartData: [], lpChange: 0, minLp: 0, maxLp: 1000 };
        }

        const first = processed[0];
        const last = processed[processed.length - 1];
        const lpChange = calculateActualLpChange(
            first.tier,
            first.rank,
            first.lp,
            last.tier,
            last.rank,
            last.lp
        );

        const allLps = processed.map(p => p.effectiveLp);
        const minLp = Math.max(0, Math.min(...allLps) - 50);
        const maxLp = Math.max(...allLps) + 50;

        const chartData = processed.map((point) => ({
            date: point.date,
            dateStr: format(point.date, "MMM d"),
            lp: point.effectiveLp,
            color: point.color,
            tier: point.tier,
            rank: point.rank,
            originalLp: point.lp,
        }));

        return { chartData, lpChange, minLp, maxLp };
    }, [history, daysToShow, startDate]);

    const yAxisSegments = useMemo(() => {
        if (chartData.length === 0) return [];
        
        const segments: Array<{ y0: number; y1: number; color: string; label: string }> = [];
        
        const tierRanges = new Map<string, { min: number; max: number; color: string; label: string }>();
        
        chartData.forEach(point => {
            const tierUpper = point.tier.toUpperCase();
            if (!tierRanges.has(tierUpper)) {
                tierRanges.set(tierUpper, {
                    min: point.lp,
                    max: point.lp,
                    color: getRankColor(point.tier),
                    label: getRankLabel(point.tier),
                });
            } else {
                const range = tierRanges.get(tierUpper)!;
                range.min = Math.min(range.min, point.lp);
                range.max = Math.max(range.max, point.lp);
            }
        });
        
        const rankOrder = ["IRON", "BRONZE", "SILVER", "GOLD", "PLATINUM", "EMERALD", "DIAMOND", "MASTER", "GRANDMASTER", "CHALLENGER"];
        const getRankOrder = (tier: string): number => {
            const index = rankOrder.indexOf(tier.toUpperCase());
            return index !== -1 ? index : 999;
        };
        
        const sortedTiers = Array.from(tierRanges.entries())
            .map(([tier, range]) => ({ tier, ...range }))
            .sort((a, b) => getRankOrder(a.tier) - getRankOrder(b.tier));
        
        sortedTiers.forEach((tierData, idx) => {
            let segmentMin: number;
            let segmentMax: number;
            
            if (sortedTiers.length === 1) {
                segmentMin = minLp;
                segmentMax = maxLp;
            } else if (idx === 0) {
                const nextTier = sortedTiers[idx + 1];
                const midpoint = (tierData.max + nextTier.min) / 2;
                segmentMin = minLp;
                segmentMax = midpoint;
            } else if (idx === sortedTiers.length - 1) {
                const prevTier = sortedTiers[idx - 1];
                const midpoint = (prevTier.max + tierData.min) / 2;
                segmentMin = midpoint;
                segmentMax = maxLp;
            } else {
                const prevTier = sortedTiers[idx - 1];
                const nextTier = sortedTiers[idx + 1];
                const prevMidpoint = (prevTier.max + tierData.min) / 2;
                const nextMidpoint = (tierData.max + nextTier.min) / 2;
                segmentMin = prevMidpoint;
                segmentMax = nextMidpoint;
            }
            
            if (segmentMax >= minLp && segmentMin <= maxLp && segmentMax > segmentMin) {
                segments.push({
                    y0: segmentMin,
                    y1: segmentMax,
                    color: tierData.color,
                    label: tierData.label,
                });
            }
        });
        
        return segments;
    }, [chartData, minLp, maxLp]);

    const lineSegments = useMemo(() => {
        if (chartData.length === 0) return [];
        
        const segments: Array<{ data: typeof chartData; color: string }> = [];
        let currentSegment: typeof chartData = [chartData[0]];
        let currentColor = chartData[0].color;
        
        for (let i = 1; i < chartData.length; i++) {
            if (chartData[i].color === currentColor) {
                currentSegment.push(chartData[i]);
            } else {
                if (currentSegment.length > 0) {
                    segments.push({ data: [...currentSegment], color: currentColor });
                }
                currentSegment = [chartData[i - 1], chartData[i]];
                currentColor = chartData[i].color;
            }
        }
        
        if (currentSegment.length > 0) {
            segments.push({ data: currentSegment, color: currentColor });
        }
        
        return segments;
    }, [chartData]);

    if (loading) {
        return (
            <div className="w-full h-16 flex items-center justify-center bg-neutral-800 rounded">
                <p className="text-neutral-400">Loading chart...</p>
            </div>
        );
    }

    if (chartData.length === 0) {
        return (
            <div className="w-full h-16 flex items-center justify-center bg-neutral-800 rounded">
                <p className="text-neutral-400">No data available</p>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-neutral-800 border border-neutral-600 rounded p-2 shadow-lg">
                    <p className="text-neutral-200 text-sm">
                        {format(data.date, "MMM d, yyyy HH:mm")}
                    </p>
                    <p className="text-neutral-300 text-sm font-semibold">
                    {data.tier}{data.tier === "CHALLENGER" || data.tier === "GRANDMASTER" || data.tier === "MASTER" ? "" : " " + data.rank} {data.originalLp} LP
                    </p>
                </div>
            );
        }
        return null;
    };

    const CustomYAxisTick = () => {
        return null;
    };

    const CustomXAxisTick = () => {
        return null;
    };

    return (
        <div className={`w-full bg-neutral-800 rounded pr-4 ${classes}`}>
            <div className="flex items-center justify-end mb-2">
                {lpChange !== 0 && (
                    <div className="flex items-center gap-1">
                        <span className={`text-sm font-bold ${lpChange > 0 ? "text-green-500" : "text-red-500"}`}>
                            {lpChange > 0 ? "▲" : "▼"} {Math.abs(lpChange)} LP
                        </span>
                    </div>
                )}
            </div>
            <div className="w-full h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 10, left: 50, bottom: 30 }}
                    >
                        <defs>
                            {yAxisSegments.map((segment, idx) => (
                                <linearGradient
                                    key={`bg-gradient-${idx}`}
                                    id={`bg-gradient-${idx}`}
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop offset="0%" stopColor={segment.color} stopOpacity={0.15} />
                                    <stop offset="100%" stopColor={segment.color} stopOpacity={0.15} />
                                </linearGradient>
                            ))}
                        </defs>
                        
                        {yAxisSegments.map((segment, idx) => (
                            <ReferenceArea
                                key={`bg-${idx}`}
                                y1={segment.y0}
                                y2={segment.y1}
                                fill={segment.color}
                                fillOpacity={0.15}
                                ifOverflow="visible"
                            />
                        ))}
                        
                        {yAxisSegments.map((segment, idx) => {
                            const segmentMidpoint = (segment.y0 + segment.y1) / 2;
                            return (
                                <ReferenceLine
                                    key={`label-${idx}`}
                                    y={segmentMidpoint}
                                    stroke="none"
                                    ifOverflow="visible"
                                    label={{
                                        value: segment.label,
                                        position: "left",
                                        fill: segment.color,
                                        fontSize: 12,
                                        fontWeight: "bold",
                                        offset: 5,
                                    }}
                                />
                            );
                        })}
                        
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" opacity={0.2} />
                        
                        <XAxis
                            dataKey="date"
                            type="number"
                            scale="time"
                            domain={["dataMin", "dataMax"]}
                            tick={CustomXAxisTick}
                            stroke="#888"
                            tickFormatter={(value) => format(new Date(value), "MMM d")}
                        />
                        
                        <YAxis
                            domain={[minLp, maxLp]}
                            tick={CustomYAxisTick}
                            stroke="#888"
                            tickFormatter={() => ""}
                            width={0}
                        />
                        
                        <Tooltip content={<CustomTooltip />} />
                        
                        {lineSegments.map((segment, idx) => (
                            <Line
                                key={`line-segment-${idx}`}
                                type="monotone"
                                dataKey="lp"
                                data={segment.data}
                                stroke={segment.color}
                                strokeWidth={2.5}
                                dot={false}
                                activeDot={{ r: 5, fill: segment.color }}
                                connectNulls
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default LpHistoryChart;
