<?php
/**
 * Competitor History Handler
 * 
 * Manages historical competitor data for trend analysis and sparklines.
 * Provides APIs for saving and retrieving historical metrics.
 */

require_once __DIR__ . '/../config/db_config.php';
require_once __DIR__ . '/EliteTrafficCalculator.php';

class CompetitorHistoryHandler {
    
    /**
     * Save competitor metrics to history
     * Called after each competitor analysis
     * 
     * @param int $userId - User ID
     * @param array $competitorData - Competitor metrics
     * @param string $projectId - Project identifier
     * @return array - Save result
     */
    public static function saveToHistory($userId, $competitorData, $projectId = null) {
        try {
            $db = getDB();
            $reportDate = date('Y-m-d');
            $saved = 0;
            $errors = [];
            
            foreach ($competitorData as $comp) {
                $domain = $comp['domain'] ?? '';
                if (empty($domain)) continue;
                
                // Extract metrics
                $organicTraffic = intval($comp['organicTraffic'] ?? $comp['processedMetrics']['organicTraffic'] ?? 0);
                $trafficValue = floatval($comp['trafficValue'] ?? $comp['processedMetrics']['trafficValue'] ?? 0);
                $authorityScore = floatval($comp['authorityScore'] ?? $comp['processedMetrics']['authorityScore'] ?? 0);
                $pageRank = floatval($comp['pageRank'] ?? $comp['opr']['page_rank_decimal'] ?? 0);
                $keywordCount = intval($comp['keywordCount'] ?? $comp['processedMetrics']['keywordCount'] ?? 0);
                $avgPosition = floatval($comp['avgPosition'] ?? 0);
                $performanceScore = intval($comp['performanceScore'] ?? $comp['pageSpeed']['scores']['performance'] ?? 0);
                $seoScore = intval($comp['seoScore'] ?? $comp['pageSpeed']['scores']['seo'] ?? 0);
                $siteHealth = intval($comp['siteHealth'] ?? 0);
                $backlinks = intval($comp['backlinks'] ?? 0);
                $referringDomains = intval($comp['referringDomains'] ?? 0);
                
                try {
                    $stmt = $db->prepare("
                        INSERT INTO competitor_history (
                            user_id, competitor_domain, report_date, project_id,
                            organic_traffic, traffic_value, authority_score, page_rank,
                            keyword_count, avg_position, performance_score, seo_score,
                            site_health, backlinks_estimate, referring_domains
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON DUPLICATE KEY UPDATE
                            organic_traffic = VALUES(organic_traffic),
                            traffic_value = VALUES(traffic_value),
                            authority_score = VALUES(authority_score),
                            page_rank = VALUES(page_rank),
                            keyword_count = VALUES(keyword_count),
                            avg_position = VALUES(avg_position),
                            performance_score = VALUES(performance_score),
                            seo_score = VALUES(seo_score),
                            site_health = VALUES(site_health),
                            backlinks_estimate = VALUES(backlinks_estimate),
                            referring_domains = VALUES(referring_domains),
                            updated_at = CURRENT_TIMESTAMP
                    ");
                    
                    $stmt->execute([
                        $userId, $domain, $reportDate, $projectId,
                        $organicTraffic, $trafficValue, $authorityScore, $pageRank,
                        $keywordCount, $avgPosition, $performanceScore, $seoScore,
                        $siteHealth, $backlinks, $referringDomains
                    ]);
                    
                    $saved++;
                } catch (Exception $e) {
                    $errors[] = "Failed to save $domain: " . $e->getMessage();
                }
            }
            
            return [
                'success' => true,
                'saved' => $saved,
                'total' => count($competitorData),
                'errors' => $errors,
                'date' => $reportDate
            ];
            
        } catch (Exception $e) {
            error_log("CompetitorHistory save error: " . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Get historical trend data for sparklines
     * 
     * @param int $userId - User ID
     * @param string $domain - Competitor domain
     * @param int $days - Number of days of history (30, 60, 90)
     * @return array - Trend data with sparkline points
     */
    public static function getTrend($userId, $domain, $days = 30) {
        try {
            $db = getDB();
            
            $stmt = $db->prepare("
                SELECT 
                    report_date,
                    organic_traffic,
                    traffic_value,
                    authority_score,
                    keyword_count,
                    site_health
                FROM competitor_history
                WHERE user_id = ? AND competitor_domain = ?
                  AND report_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
                ORDER BY report_date ASC
            ");
            
            $stmt->execute([$userId, $domain, $days]);
            $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if (empty($history)) {
                return [
                    'success' => true,
                    'hasTrend' => false,
                    'message' => 'No historical data available',
                    'sparkline' => [],
                    'trend' => null
                ];
            }
            
            // Generate sparkline data
            $sparklineTraffic = array_column($history, 'organic_traffic');
            $sparklineValue = array_column($history, 'traffic_value');
            
            // Calculate trend direction
            $firstTraffic = floatval($history[0]['organic_traffic']);
            $lastTraffic = floatval($history[count($history) - 1]['organic_traffic']);
            $trafficChange = $firstTraffic > 0 
                ? round((($lastTraffic - $firstTraffic) / $firstTraffic) * 100, 1) 
                : 0;
            
            // Determine trend direction
            if ($trafficChange > 5) {
                $trendDirection = 'up';
                $trendIcon = '📈';
                $trendColor = '#10b981';
            } elseif ($trafficChange < -5) {
                $trendDirection = 'down';
                $trendIcon = '📉';
                $trendColor = '#ef4444';
            } else {
                $trendDirection = 'stable';
                $trendIcon = '➡️';
                $trendColor = '#3b82f6';
            }
            
            return [
                'success' => true,
                'hasTrend' => true,
                'domain' => $domain,
                'days' => $days,
                'dataPoints' => count($history),
                'sparkline' => [
                    'traffic' => $sparklineTraffic,
                    'value' => $sparklineValue
                ],
                'trend' => [
                    'direction' => $trendDirection,
                    'icon' => $trendIcon,
                    'color' => $trendColor,
                    'changePercent' => $trafficChange,
                    'changeLabel' => ($trafficChange >= 0 ? '+' : '') . $trafficChange . '%',
                    'firstValue' => $firstTraffic,
                    'lastValue' => $lastTraffic
                ],
                'history' => $history
            ];
            
        } catch (Exception $e) {
            error_log("CompetitorHistory getTrend error: " . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Get comparison data for multiple competitors
     * 
     * @param int $userId - User ID
     * @param array $domains - Array of competitor domains
     * @param int $days - Days of history
     * @return array - Comparative trend data
     */
    public static function getComparison($userId, $domains, $days = 30) {
        $comparison = [];
        
        foreach ($domains as $domain) {
            $trend = self::getTrend($userId, $domain, $days);
            $comparison[$domain] = $trend;
        }
        
        return [
            'success' => true,
            'competitors' => $comparison,
            'days' => $days
        ];
    }
    
    /**
     * Generate SVG sparkline
     * 
     * @param array $values - Array of numeric values
     * @param int $width - SVG width
     * @param int $height - SVG height
     * @param string $color - Line color
     * @return string - SVG markup
     */
    public static function generateSparklineSvg($values, $width = 100, $height = 30, $color = '#3b82f6') {
        if (empty($values) || count($values) < 2) {
            return '<svg width="' . $width . '" height="' . $height . '"><text x="5" y="20" font-size="10" fill="#9ca3af">No data</text></svg>';
        }
        
        $min = min($values);
        $max = max($values);
        $range = $max - $min ?: 1;
        $count = count($values);
        $step = $width / ($count - 1);
        
        $points = [];
        foreach ($values as $i => $value) {
            $x = round($i * $step, 2);
            $y = round($height - (($value - $min) / $range * ($height - 4)) - 2, 2);
            $points[] = "$x,$y";
        }
        
        $path = implode(' ', $points);
        
        // Determine trend color
        $firstVal = floatval($values[0]);
        $lastVal = floatval($values[count($values) - 1]);
        if ($lastVal > $firstVal * 1.05) {
            $color = '#10b981'; // Green for growth
        } elseif ($lastVal < $firstVal * 0.95) {
            $color = '#ef4444'; // Red for decline
        }
        
        return '<svg width="' . $width . '" height="' . $height . '" viewBox="0 0 ' . $width . ' ' . $height . '">' .
               '<polyline points="' . $path . '" fill="none" stroke="' . $color . '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' .
               '</svg>';
    }
    
    /**
     * Get dashboard summary with trends
     * 
     * @param int $userId - User ID
     * @param string $projectId - Project ID
     * @return array - Dashboard summary
     */
    public static function getDashboardSummary($userId, $projectId = null) {
        try {
            $db = getDB();
            
            // Get latest report date
            $stmt = $db->prepare("
                SELECT MAX(report_date) as latest_date
                FROM competitor_history
                WHERE user_id = ?
            ");
            $stmt->execute([$userId]);
            $latest = $stmt->fetch();
            $latestDate = $latest['latest_date'] ?? date('Y-m-d');
            
            // Get summary for latest date
            $stmt = $db->prepare("
                SELECT 
                    COUNT(DISTINCT competitor_domain) as competitor_count,
                    SUM(organic_traffic) as total_traffic,
                    SUM(traffic_value) as total_value,
                    AVG(authority_score) as avg_authority,
                    SUM(keyword_count) as total_keywords
                FROM competitor_history
                WHERE user_id = ? AND report_date = ?
            ");
            $stmt->execute([$userId, $latestDate]);
            $summary = $stmt->fetch();
            
            // Get 30-day change
            $prevDate = date('Y-m-d', strtotime('-30 days', strtotime($latestDate)));
            $stmt = $db->prepare("
                SELECT SUM(organic_traffic) as prev_traffic
                FROM competitor_history
                WHERE user_id = ? AND report_date = ?
            ");
            $stmt->execute([$userId, $prevDate]);
            $prev = $stmt->fetch();
            
            $prevTraffic = floatval($prev['prev_traffic'] ?? 0);
            $currentTraffic = floatval($summary['total_traffic'] ?? 0);
            $trafficChange = $prevTraffic > 0 
                ? round((($currentTraffic - $prevTraffic) / $prevTraffic) * 100, 1)
                : 0;
            
            return [
                'success' => true,
                'date' => $latestDate,
                'summary' => [
                    'competitorCount' => intval($summary['competitor_count'] ?? 0),
                    'totalTraffic' => intval($summary['total_traffic'] ?? 0),
                    'totalValue' => floatval($summary['total_value'] ?? 0),
                    'avgAuthority' => round(floatval($summary['avg_authority'] ?? 0), 1),
                    'totalKeywords' => intval($summary['total_keywords'] ?? 0)
                ],
                'change' => [
                    'traffic' => $trafficChange,
                    'direction' => $trafficChange > 0 ? 'up' : ($trafficChange < 0 ? 'down' : 'stable')
                ]
            ];
            
        } catch (Exception $e) {
            error_log("CompetitorHistory getDashboardSummary error: " . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}
