<?php
/**
 * Data Inventory Script
 * Shows what data exists in your MySQL tables
 * URL: https://serpifai.com/serpifai_php/data_inventory.php
 */

header('Content-Type: text/html; charset=utf-8');

require_once __DIR__ . '/config/db_config.php';

echo "<!DOCTYPE html><html><head><title>SerpifAI Data Inventory</title>";
echo "<style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; background: #1a1a2e; color: #eee; }
h1, h2 { color: #00d4ff; }
table { border-collapse: collapse; width: 100%; margin: 20px 0; background: #16213e; }
th, td { border: 1px solid #0f3460; padding: 10px; text-align: left; }
th { background: #0f3460; color: #00d4ff; }
tr:hover { background: #1a1a4e; }
.success { color: #4ade80; }
.warning { color: #fbbf24; }
.error { color: #f87171; }
.json-preview { max-width: 600px; overflow: hidden; text-overflow: ellipsis; font-size: 12px; color: #888; }
.count { font-size: 24px; font-weight: bold; color: #00d4ff; }
.card { background: #16213e; padding: 20px; border-radius: 10px; margin: 10px; display: inline-block; min-width: 200px; }
</style></head><body>";

echo "<h1>📊 SerpifAI Data Inventory</h1>";
echo "<p>Generated: " . date('Y-m-d H:i:s') . "</p>";

try {
    $db = getDB();
    
    // ═══════════════════════════════════════════════════════════════════════════
    // TABLE ROW COUNTS
    // ═══════════════════════════════════════════════════════════════════════════
    echo "<h2>📈 Table Statistics</h2>";
    echo "<div style='display: flex; flex-wrap: wrap;'>";
    
    $tables = [
        'users' => '👤 Users',
        'projects' => '📁 Projects',
        'competitor_analysis_results' => '🏆 Analysis Results',
        'competitor_trends' => '📊 Trend Data',
        'competitor_analysis_categories' => '📑 Category Data',
        'api_transactions' => '💳 Transactions',
        'gemini_analysis_cache' => '🤖 AI Cache',
        'keyword_intelligence' => '🔑 Keywords',
        'fetcher_cache' => '🌐 Fetch Cache'
    ];
    
    foreach ($tables as $table => $label) {
        try {
            $stmt = $db->query("SELECT COUNT(*) as cnt FROM $table");
            $count = $stmt->fetch(PDO::FETCH_ASSOC)['cnt'];
            $color = $count > 0 ? 'success' : 'warning';
            echo "<div class='card'><div class='$color'>$label</div><div class='count'>$count</div></div>";
        } catch (PDOException $e) {
            echo "<div class='card'><div class='error'>$label</div><div>Table missing</div></div>";
        }
    }
    echo "</div>";
    
    // ═══════════════════════════════════════════════════════════════════════════
    // RECENT ANALYSIS RESULTS
    // ═══════════════════════════════════════════════════════════════════════════
    echo "<h2>🏆 Recent Competitor Analysis Results</h2>";
    
    try {
        $stmt = $db->query("
            SELECT 
                id, project_id, your_domain, competitor_count, 
                data_quality, api_success,
                LENGTH(analysis_data) as data_size,
                created_at, updated_at
            FROM competitor_analysis_results 
            ORDER BY created_at DESC 
            LIMIT 10
        ");
        
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (count($results) > 0) {
            echo "<table><tr><th>ID</th><th>Project</th><th>Your Domain</th><th>Competitors</th><th>Quality</th><th>Data Size</th><th>Created</th></tr>";
            foreach ($results as $row) {
                $sizeKB = round($row['data_size'] / 1024, 1);
                $quality = $row['data_quality'] ?? 'N/A';
                echo "<tr>";
                echo "<td>{$row['id']}</td>";
                echo "<td>{$row['project_id']}</td>";
                echo "<td>{$row['your_domain']}</td>";
                echo "<td>{$row['competitor_count']}</td>";
                echo "<td>{$quality}%</td>";
                echo "<td>{$sizeKB} KB</td>";
                echo "<td>{$row['created_at']}</td>";
                echo "</tr>";
            }
            echo "</table>";
        } else {
            echo "<p class='warning'>No analysis results found</p>";
        }
    } catch (PDOException $e) {
        echo "<p class='error'>Error: " . $e->getMessage() . "</p>";
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // SAMPLE DATA STRUCTURE
    // ═══════════════════════════════════════════════════════════════════════════
    echo "<h2>🔍 Sample Data Structure (Latest Analysis)</h2>";
    
    try {
        $stmt = $db->query("
            SELECT analysis_data 
            FROM competitor_analysis_results 
            ORDER BY created_at DESC 
            LIMIT 1
        ");
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row && !empty($row['analysis_data'])) {
            $data = json_decode($row['analysis_data'], true);
            
            if ($data) {
                echo "<h3>Top-Level Keys in analysis_data:</h3>";
                echo "<table><tr><th>Key</th><th>Type</th><th>Content Preview</th></tr>";
                
                foreach ($data as $key => $value) {
                    $type = gettype($value);
                    if (is_array($value)) {
                        $type = "array[" . count($value) . "]";
                        $preview = array_keys($value);
                        $preview = implode(', ', array_slice($preview, 0, 5));
                        if (count($value) > 5) $preview .= '...';
                    } else if (is_string($value)) {
                        $preview = substr($value, 0, 100) . (strlen($value) > 100 ? '...' : '');
                    } else {
                        $preview = json_encode($value);
                    }
                    
                    echo "<tr><td><strong>$key</strong></td><td>$type</td><td class='json-preview'>$preview</td></tr>";
                }
                echo "</table>";
                
                // Check for Elite Tab Intelligence
                echo "<h3>Elite Tab Intelligence Status:</h3>";
                $eliteLocations = [
                    'data.eliteTabIntelligence' => $data['eliteTabIntelligence'] ?? null,
                    'data.analysis.eliteTabIntelligence' => $data['analysis']['eliteTabIntelligence'] ?? null,
                    'data.organizedData.eliteInsights' => $data['organizedData']['eliteInsights'] ?? null
                ];
                
                echo "<table><tr><th>Location</th><th>Exists?</th><th>Keys</th></tr>";
                foreach ($eliteLocations as $loc => $val) {
                    $exists = $val ? '✅ Yes' : '❌ No';
                    $keys = $val && is_array($val) ? implode(', ', array_slice(array_keys($val), 0, 8)) : '-';
                    echo "<tr><td>$loc</td><td>$exists</td><td>$keys</td></tr>";
                }
                echo "</table>";
                
                // Check for Executive Brief (V6's rich analysis)
                echo "<h3>🎯 Executive Brief (V6 Strategic Analysis):</h3>";
                $execBriefLocations = [
                    'data.executiveBrief' => $data['executiveBrief'] ?? null,
                    'data.analysis.executiveBrief' => $data['analysis']['executiveBrief'] ?? null,
                    'data.geminiAnalysis.executiveBrief' => $data['geminiAnalysis']['executiveBrief'] ?? null,
                ];
                
                echo "<table><tr><th>Location</th><th>Exists?</th><th>Sub-keys</th></tr>";
                foreach ($execBriefLocations as $loc => $val) {
                    $exists = $val ? '✅ Yes' : '❌ No';
                    $keys = $val && is_array($val) ? implode(', ', array_slice(array_keys($val), 0, 10)) : '-';
                    echo "<tr><td>$loc</td><td>$exists</td><td>$keys</td></tr>";
                }
                echo "</table>";
                
                // If executiveBrief exists, show its structure
                $execBrief = $data['analysis']['executiveBrief'] ?? $data['executiveBrief'] ?? null;
                if ($execBrief && is_array($execBrief)) {
                    echo "<h4>📊 executiveBrief Contents:</h4>";
                    echo "<table><tr><th>Field</th><th>Status</th></tr>";
                    $expectedFields = ['landscapeOverview', 'clientPosition', 'criticalThreats', 'strategicOpportunities', 
                                      'jobsToBeDone', 'lossLeaderAnalysis', 'emotionalDebtAudit', 'timeToValueComparison',
                                      'programmaticSEOMoat', 'prioritizedRoadmap'];
                    foreach ($expectedFields as $field) {
                        $hasField = isset($execBrief[$field]) && $execBrief[$field] ? '✅' : '❌';
                        echo "<tr><td>$field</td><td>$hasField</td></tr>";
                    }
                    echo "</table>";
                }
                
                // Check killMoves (V6 Kill Moves array)
                echo "<h3>⚔️ Kill Moves (Strategic Attacks):</h3>";
                $killMovesLocations = [
                    'data.killMoves' => $data['killMoves'] ?? null,
                    'data.analysis.killMoves' => $data['analysis']['killMoves'] ?? null,
                    'data.geminiAnalysis.killMoves' => $data['geminiAnalysis']['killMoves'] ?? null,
                ];
                echo "<table><tr><th>Location</th><th>Count</th></tr>";
                foreach ($killMovesLocations as $loc => $val) {
                    $count = $val && is_array($val) ? count($val) : '❌ Missing';
                    echo "<tr><td>$loc</td><td>$count</td></tr>";
                }
                echo "</table>";
                
                // Check Gemini analysis object structure
                echo "<h3>🤖 data.analysis (Gemini Response):</h3>";
                if (isset($data['analysis']) && is_array($data['analysis'])) {
                    echo "<table><tr><th>Key</th><th>Status</th><th>Details</th></tr>";
                    $analysisKeys = ['executiveBrief', 'killMoves', 'estimatedMetrics', 'marketIntelligence', 
                                    'keywordIntelligence', 'categories', 'competitorRankings'];
                    foreach ($analysisKeys as $key) {
                        $val = $data['analysis'][$key] ?? null;
                        $hasKey = $val ? '✅' : '❌';
                        $details = $val && is_array($val) ? (isset($val[0]) ? 'array['.count($val).']' : 'object{'.count($val).'}') : '-';
                        echo "<tr><td>$key</td><td>$hasKey</td><td>$details</td></tr>";
                    }
                    echo "</table>";
                } else {
                    echo "<p class='warning'>⚠️ data.analysis is missing or not an array</p>";
                }
                
                // Check rawData structure (object with domain keys)
                if (isset($data['rawData']) && is_array($data['rawData']) && !isset($data['rawData']['_trimmed'])) {
                    echo "<h3>📦 rawData (Original Domain-Keyed Object):</h3>";
                    echo "<table><tr><th>Domain Key</th><th>Has Stages?</th><th>Has apiData?</th><th>Has processedMetrics?</th></tr>";
                    
                    foreach (array_slice($data['rawData'], 0, 5, true) as $domainKey => $comp) {
                        if (!is_array($comp)) continue;
                        $hasStages = isset($comp['stages']) ? '✅' : '❌';
                        $hasApiData = isset($comp['apiData']) ? '✅' : '❌';
                        $hasMetrics = isset($comp['processedMetrics']) ? '✅' : '❌';
                        echo "<tr><td><strong>$domainKey</strong></td><td>$hasStages</td><td>$hasApiData</td><td>$hasMetrics</td></tr>";
                    }
                    echo "</table>";
                } else {
                    echo "<p class='warning'>⚠️ rawData is trimmed or missing</p>";
                }
                
                // Check competitorsArray structure (array format for UI)
                if (isset($data['competitorsArray']) && is_array($data['competitorsArray'])) {
                    echo "<h3>📋 competitorsArray (Pre-Transformed for UI):</h3>";
                    echo "<table><tr><th>#</th><th>Domain</th><th>Has Stages?</th><th>Has apiData?</th><th>Has processedMetrics?</th><th>Has synthesized?</th></tr>";
                    
                    foreach (array_slice($data['competitorsArray'], 0, 6) as $idx => $comp) {
                        $domain = $comp['domain'] ?? $comp['url'] ?? 'Unknown';
                        $hasStages = isset($comp['stages']) ? '✅' : '❌';
                        $hasApiData = isset($comp['apiData']) ? '✅' : '❌';
                        $hasMetrics = isset($comp['processedMetrics']) ? '✅' : '❌';
                        $hasSynth = isset($comp['synthesized']) ? '✅' : '❌';
                        echo "<tr><td>$idx</td><td><strong>$domain</strong></td><td>$hasStages</td><td>$hasApiData</td><td>$hasMetrics</td><td>$hasSynth</td></tr>";
                    }
                    echo "</table>";
                    
                    // Show first competitor's structure
                    if (count($data['competitorsArray']) > 0) {
                        $first = $data['competitorsArray'][0];
                        echo "<h4>First Competitor Structure (keys):</h4>";
                        echo "<pre style='background:#0f3460;padding:10px;border-radius:5px;overflow-x:auto;'>";
                        echo "Top keys: " . implode(', ', array_keys($first)) . "\n\n";
                        
                        if (isset($first['stages'])) {
                            echo "stages keys: " . implode(', ', array_keys($first['stages'])) . "\n";
                        }
                        if (isset($first['apiData'])) {
                            echo "apiData keys: " . implode(', ', array_keys($first['apiData'])) . "\n";
                        }
                        if (isset($first['synthesized'])) {
                            echo "synthesized keys: " . implode(', ', array_keys($first['synthesized'])) . "\n";
                        }
                        echo "</pre>";
                    }
                } else {
                    echo "<p class='error'>❌ competitorsArray is MISSING - UI cannot display data!</p>";
                }
                
                // Legacy competitors field (just domain list)
                if (isset($data['competitors']) && is_array($data['competitors'])) {
                    echo "<h3>📝 competitors (Domain List Only):</h3>";
                    echo "<p>This is just a list of domain names, NOT the full data:</p>";
                    echo "<pre style='background:#0f3460;padding:10px;border-radius:5px;'>";
                    echo json_encode($data['competitors'], JSON_PRETTY_PRINT);
                    echo "</pre>";
                }
                
                // ═══════════════════════════════════════════════════════════════════════════
                // v30.1 FIX SIMULATION: Show what data will look like AFTER load normalization
                // ═══════════════════════════════════════════════════════════════════════════
                echo "<h2>🔧 v30.1 Load Fix Simulation</h2>";
                echo "<p>This simulates what the PHP load handler will do to normalize the data:</p>";
                
                $normalized = $data; // Copy original
                
                // 1. geminiAnalysis → analysis
                if (!empty($normalized['geminiAnalysis']) && empty($normalized['analysis'])) {
                    $normalized['analysis'] = $normalized['geminiAnalysis'];
                }
                
                // 2. Surface executiveBrief
                $execBrief = $normalized['geminiAnalysis']['executiveBrief'] ?? $normalized['analysis']['executiveBrief'] ?? null;
                if ($execBrief && empty($normalized['executiveBrief'])) {
                    $normalized['executiveBrief'] = $execBrief;
                }
                
                // 3. Surface killMoves
                $killMoves = $normalized['geminiAnalysis']['killMoves'] ?? $normalized['analysis']['killMoves'] ?? null;
                if ($killMoves && is_array($killMoves) && empty($normalized['killMoves'])) {
                    $normalized['killMoves'] = $killMoves;
                }
                
                // 4. Surface estimatedMetrics
                $estMetrics = $normalized['geminiAnalysis']['estimatedMetrics'] ?? $normalized['analysis']['estimatedMetrics'] ?? null;
                if ($estMetrics && is_array($estMetrics) && empty($normalized['estimatedMetrics'])) {
                    $normalized['estimatedMetrics'] = $estMetrics;
                }
                
                // 5. Surface marketIntelligence
                $marketIntel = $normalized['geminiAnalysis']['marketIntelligence'] ?? null;
                if ($marketIntel && empty($normalized['marketIntelligence'])) {
                    $normalized['marketIntelligence'] = $marketIntel;
                }
                
                // 6. Surface keywordIntelligence
                $keywordIntel = $normalized['geminiAnalysis']['keywordIntelligence'] ?? null;
                if ($keywordIntel && empty($normalized['keywordIntelligence'])) {
                    $normalized['keywordIntelligence'] = $keywordIntel;
                }
                
                // 7. Transform rawData → competitorsArray
                if (empty($normalized['competitorsArray']) && !empty($normalized['rawData']) && !isset($normalized['rawData']['_trimmed'])) {
                    $competitorsArray = [];
                    foreach ($normalized['rawData'] as $domain => $compData) {
                        if (is_array($compData)) {
                            $compData['domain'] = $compData['domain'] ?? $domain;
                            $competitorsArray[] = $compData;
                        }
                    }
                    if (count($competitorsArray) > 0) {
                        $normalized['competitorsArray'] = $competitorsArray;
                    }
                }
                
                echo "<h3>🎯 After v30.1 Normalization:</h3>";
                echo "<table><tr><th>Field</th><th>Before</th><th>After</th></tr>";
                
                $fields = ['analysis', 'executiveBrief', 'killMoves', 'estimatedMetrics', 'marketIntelligence', 
                           'keywordIntelligence', 'competitorsArray', 'categories', 'competitorRankings'];
                
                foreach ($fields as $field) {
                    $before = isset($data[$field]) ? (is_array($data[$field]) ? '✅ (' . count($data[$field]) . ')' : '✅') : '❌';
                    $after = isset($normalized[$field]) ? (is_array($normalized[$field]) ? '✅ (' . count($normalized[$field]) . ')' : '✅') : '❌';
                    $highlight = ($before === '❌' && $after !== '❌') ? 'style="background:#10b981;color:white;"' : '';
                    echo "<tr $highlight><td><strong>$field</strong></td><td>$before</td><td>$after</td></tr>";
                }
                echo "</table>";
                
                // Show executiveBrief contents after fix
                if (isset($normalized['executiveBrief']) && is_array($normalized['executiveBrief'])) {
                    echo "<h4>✅ executiveBrief Now Available at Top Level:</h4>";
                    echo "<table><tr><th>Field</th><th>Status</th></tr>";
                    $expectedFields = ['landscapeOverview', 'clientPosition', 'criticalThreats', 'strategicOpportunities', 
                                      'jobsToBeDone', 'lossLeaderAnalysis', 'emotionalDebtAudit', 'timeToValueComparison',
                                      'programmaticSEOMoat', 'prioritizedRoadmap', 'threeLineSummary'];
                    foreach ($expectedFields as $f) {
                        $hasField = isset($normalized['executiveBrief'][$f]) && $normalized['executiveBrief'][$f] ? '✅' : '❌';
                        echo "<tr><td>$f</td><td>$hasField</td></tr>";
                    }
                    echo "</table>";
                }
                
                // Show estimatedMetrics (for traffic/keyword accuracy)
                if (isset($normalized['estimatedMetrics']) && is_array($normalized['estimatedMetrics'])) {
                    echo "<h4>📊 Gemini Estimated Metrics (for accurate traffic/keywords):</h4>";
                    echo "<table><tr><th>Domain</th><th>Traffic</th><th>Keywords</th><th>Backlinks</th><th>Authority</th></tr>";
                    foreach ($normalized['estimatedMetrics'] as $metric) {
                        $domain = $metric['domain'] ?? 'Unknown';
                        $traffic = number_format($metric['organicTraffic'] ?? 0);
                        $keywords = number_format($metric['organicKeywords'] ?? 0);
                        $backlinks = number_format($metric['backlinks'] ?? 0);
                        $authority = $metric['authorityScore'] ?? '-';
                        echo "<tr><td><strong>$domain</strong></td><td>$traffic</td><td>$keywords</td><td>$backlinks</td><td>$authority</td></tr>";
                    }
                    echo "</table>";
                }
                
            } else {
                echo "<p class='error'>Failed to parse JSON data</p>";
            }
        } else {
            echo "<p class='warning'>No analysis data found</p>";
        }
    } catch (PDOException $e) {
        echo "<p class='error'>Error: " . $e->getMessage() . "</p>";
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // TREND DATA
    // ═══════════════════════════════════════════════════════════════════════════
    echo "<h2>📊 Competitor Trends (Historical Data)</h2>";
    
    try {
        $stmt = $db->query("
            SELECT domain, COUNT(*) as data_points, 
                   MIN(snapshot_date) as first_date,
                   MAX(snapshot_date) as last_date
            FROM competitor_trends 
            GROUP BY domain 
            ORDER BY data_points DESC
            LIMIT 10
        ");
        
        $trends = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (count($trends) > 0) {
            echo "<table><tr><th>Domain</th><th>Data Points</th><th>First Date</th><th>Last Date</th></tr>";
            foreach ($trends as $row) {
                echo "<tr><td>{$row['domain']}</td><td>{$row['data_points']}</td><td>{$row['first_date']}</td><td>{$row['last_date']}</td></tr>";
            }
            echo "</table>";
        } else {
            echo "<p class='warning'>⚠️ No trend data found - Historical charts won't work!</p>";
            echo "<p>Trend data needs to be saved after each analysis to show sparklines.</p>";
        }
    } catch (PDOException $e) {
        echo "<p class='warning'>competitor_trends table not available</p>";
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // CATEGORY DATA
    // ═══════════════════════════════════════════════════════════════════════════
    echo "<h2>📑 Analysis Categories (Per-Tab Data)</h2>";
    
    try {
        $stmt = $db->query("SELECT COUNT(*) as cnt FROM competitor_analysis_categories");
        $count = $stmt->fetch(PDO::FETCH_ASSOC)['cnt'];
        
        if ($count > 0) {
            echo "<p class='success'>✅ $count category records found</p>";
        } else {
            echo "<p class='warning'>⚠️ Category table is EMPTY - Per-tab storage not implemented!</p>";
            echo "<p>This table is designed to store metrics for each of the 15 UI tabs separately, but it's never written to.</p>";
        }
    } catch (PDOException $e) {
        echo "<p class='error'>Table doesn't exist</p>";
    }

} catch (Exception $e) {
    echo "<p class='error'>Database error: " . $e->getMessage() . "</p>";
}

echo "</body></html>";
?>
