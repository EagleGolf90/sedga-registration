<?php
/**
 * Load prices from JSON file
 * Returns pricing data for event categories and optional services
 */

function getPricesData() {
    $jsonFile = '../data/prices-data.json';
    
    if (!file_exists($jsonFile)) {
        return [
            'eventCategories' => [],
            'optionalServices' => []
        ];
    }
    
    $jsonContent = file_get_contents($jsonFile);
    $pricesData = json_decode($jsonContent, true);
    
    return $pricesData ?? [
        'eventCategories' => [],
        'optionalServices' => []
    ];
}

// Get the prices data
$prices = getPricesData();
?>
