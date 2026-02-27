import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface NeuralSignature {
    percentile: number;
    overall_score: number;
    logic: number;
    creativity: number;
    intuition: number;
    emotional_intelligence: number;
    systems_thinking: number;
    field: string;
    subfield: string;
    famous_match: string;
    superpowers: string[];
    blind_spots: string[];
}

export interface UserRanking extends NeuralSignature {
    user_id: string;
    username: string;
    country: string;
    avatar_url: string;
    rank: number;
    test_count: number;
}

export function useNeuralSignature(userId?: string) {
    const [loading, setLoading] = useState(true);
    const [allRankings, setAllRankings] = useState<UserRanking[]>([]);
    const [userSignature, setUserSignature] = useState<UserRanking | null>(null);
    const [userHistory, setUserHistory] = useState<any[]>([]);
    const [totalPlayers, setTotalPlayers] = useState(0);

    useEffect(() => {
        const calculateWeighted = (results: any[], key: string) => {
            if (results.length === 0) return 0;
            // Sort by date descending
            const sorted = [...results].sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            let totalWeight = 0;
            let weightedSum = 0;

            sorted.forEach((r, i) => {
                const weight = Math.pow(0.5, i);
                weightedSum += (r[key] || 0) * weight;
                totalWeight += weight;
            });

            return Math.round(weightedSum / totalWeight);
        };

        const fetchData = async () => {
            setLoading(true);
            try {
                const { data: profiles } = await supabase.from("profiles").select("user_id, username, country, avatar_url");
                const { data: results } = await supabase.from("test_results").select("*").order('created_at', { ascending: false });

                if (!profiles || !results) return;

                const userGroups = new Map();
                profiles.forEach(p => userGroups.set(p.user_id, { profile: p, results: [] }));
                results.forEach(r => {
                    if (userGroups.has(r.user_id)) {
                        userGroups.get(r.user_id).results.push(r);
                    }
                });

                const rankings: UserRanking[] = Array.from(userGroups.values())
                    .map(({ profile, results }) => {
                        const count = results.length;
                        const hasPlayed = count > 0;

                        return {
                            user_id: profile.user_id,
                            username: profile.username || "Anonymous",
                            country: profile.country || "US",
                            avatar_url: profile.avatar_url,
                            overall_score: hasPlayed ? calculateWeighted(results, 'overall_score') : 0,
                            percentile: hasPlayed ? calculateWeighted(results, 'percentile') : 0,
                            logic: hasPlayed ? calculateWeighted(results, 'logic') : 0,
                            creativity: hasPlayed ? calculateWeighted(results, 'creativity') : 0,
                            intuition: hasPlayed ? calculateWeighted(results, 'intuition') : 0,
                            emotional_intelligence: hasPlayed ? calculateWeighted(results, 'emotional_intelligence') : 0,
                            systems_thinking: hasPlayed ? calculateWeighted(results, 'systems_thinking') : 0,
                            field: hasPlayed ? results[0].field : "N/A",
                            subfield: hasPlayed ? results[0].subfield : "NONE",
                            famous_match: hasPlayed ? results[0].famous_match : "None",
                            superpowers: hasPlayed ? results[0].superpowers : [],
                            blind_spots: hasPlayed ? results[0].blind_spots : [],
                            rank: 0, // Placeholder
                            test_count: count,
                        };
                    })
                    .sort((a, b) => b.overall_score - a.overall_score)
                    .map((item, index) => ({ ...item, rank: index + 1 }));

                setAllRankings(rankings);
                setTotalPlayers(rankings.length);

                if (userId) {
                    const myResults = results.filter(r => r.user_id === userId);
                    setUserHistory(myResults);

                    const userRank = rankings.find(r => r.user_id === userId);
                    if (userRank) {
                        setUserSignature(userRank);
                    } else {
                        const profile = profiles.find(p => p.user_id === userId);
                        setUserSignature({
                            user_id: userId,
                            username: profile?.username || "You",
                            country: profile?.country || "US",
                            avatar_url: profile?.avatar_url,
                            percentile: 0, overall_score: 0, logic: 0, creativity: 0,
                            intuition: 0, emotional_intelligence: 0, systems_thinking: 0,
                            field: "UNRANKED", subfield: "NONE", famous_match: "None",
                            superpowers: [], blind_spots: [], rank: rankings.length + 1,
                            test_count: 0
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching rankings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    return { loading, allRankings, userSignature, userHistory, totalPlayers };
}
