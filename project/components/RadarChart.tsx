import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Polygon, Circle, Line, Text as SvgText, G, ForeignObject } from 'react-native-svg';
import { Attribute } from '@/types';
import { getAttributeIcon } from '@/utils/attributeIcons';

interface RadarChartProps {
  attributes: Attribute[];
  size?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export default function RadarChart({ attributes, size = Math.min(screenWidth - 40, 300) }: RadarChartProps) {
  const center = size / 2;
  const maxRadius = center - 60; // Leave space for labels
  const levels = 5; // Number of concentric circles

  // Calculate relative values (normalize to show differences)
  const values = attributes.map(attr => attr.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue;
  
  // If all values are the same, show them all at 50% radius
  const getRelativeValue = (value: number) => {
    if (range === 0) return 50; // All attributes equal, show at middle
    return 20 + ((value - minValue) / range) * 60; // Scale between 20% and 80% of radius
  };

  // Calculate points for each attribute using relative values
  const getPoint = (index: number, relativeValue: number, radius: number) => {
    const angle = (index * 2 * Math.PI) / attributes.length - Math.PI / 2; // Start from top
    const normalizedValue = relativeValue / 100;
    const actualRadius = radius * normalizedValue;
    
    return {
      x: center + actualRadius * Math.cos(angle),
      y: center + actualRadius * Math.sin(angle),
    };
  };

  // Calculate label positions
  const getLabelPoint = (index: number) => {
    const angle = (index * 2 * Math.PI) / attributes.length - Math.PI / 2;
    const labelRadius = maxRadius + 30;
    
    return {
      x: center + labelRadius * Math.cos(angle),
      y: center + labelRadius * Math.sin(angle),
    };
  };

  // Generate polygon points for the data using relative values
  const dataPoints = attributes.map((attr, index) => {
    const relativeValue = getRelativeValue(attr.value);
    return getPoint(index, relativeValue, maxRadius);
  });
  const dataPolygonPoints = dataPoints.map(point => `${point.x},${point.y}`).join(' ');

  // Generate grid lines
  const gridLines = [];
  for (let i = 0; i < attributes.length; i++) {
    const endPoint = getPoint(i, 100, maxRadius);
    gridLines.push(
      <Line
        key={`grid-${i}`}
        x1={center}
        y1={center}
        x2={endPoint.x}
        y2={endPoint.y}
        stroke="#333"
        strokeWidth="1"
        opacity="0.3"
      />
    );
  }

  // Generate concentric circles
  const circles = [];
  for (let i = 1; i <= levels; i++) {
    const radius = (maxRadius * i) / levels;
    circles.push(
      <Circle
        key={`circle-${i}`}
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="#333"
        strokeWidth="1"
        opacity="0.3"
      />
    );
  }

  // Generate relative level labels
  const levelLabels = [];
  for (let i = 1; i <= levels; i++) {
    const percentage = (i / levels) * 100;
    const radius = (maxRadius * i) / levels;
    
    // Calculate what actual value this percentage represents
    let actualValue;
    if (range === 0) {
      actualValue = minValue;
    } else {
      // Convert percentage back to actual value range
      const relativePosition = (percentage - 20) / 60; // Reverse the 20-80% scaling
      actualValue = Math.round(minValue + (relativePosition * range));
    }
    
    levelLabels.push(
      <SvgText
        key={`level-${i}`}
        x={center + radius + 5}
        y={center - 3}
        fontSize="10"
        fill="#666"
        textAnchor="start"
      >
        {actualValue}
      </SvgText>
    );
  }

  // Determine chart color based on attribute balance
  const getChartColor = () => {
    if (range === 0) return '#4ade80'; // Green for perfect balance
    if (range <= 10) return '#06b6d4'; // Cyan for good balance
    if (range <= 20) return '#ffd700'; // Gold for moderate balance
    if (range <= 30) return '#f59e0b'; // Orange for some imbalance
    return '#f87171'; // Red for high imbalance
  };

  const chartColor = getChartColor();

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <Svg width={size} height={size} style={styles.svgChart}>
          {/* Grid circles */}
          {circles}
          
          {/* Grid lines */}
          {gridLines}
          
          {/* Level labels */}
          {levelLabels}
          
          {/* Data polygon */}
          <Polygon
            points={dataPolygonPoints}
            fill={chartColor}
            fillOpacity="0.2"
            stroke={chartColor}
            strokeWidth="2"
          />
          
          {/* Data points */}
          {dataPoints.map((point, index) => (
            <Circle
              key={`point-${index}`}
              cx={point.x}
              cy={point.y}
              r="4"
              fill={chartColor}
              stroke="#1a1a2e"
              strokeWidth="2"
            />
          ))}
          
          {/* Attribute labels */}
          {attributes.map((attr, index) => {
            const labelPoint = getLabelPoint(index);
            return (
              <SvgText
                key={`label-${index}`}
                x={labelPoint.x}
                y={labelPoint.y}
                fontSize="12"
                fill="#ffd700"
                textAnchor="middle"
                fontWeight="200"
              >
                {attr.name}
              </SvgText>
            );
          })}
        </Svg>
        
        {/* Overlay icons using absolute positioning */}
        {attributes.map((attr, index) => {
          const labelPoint = getLabelPoint(index);
          const IconComponent = getAttributeIcon(attr.id);
          
          // Calculate position relative to the chart container
          const iconX = labelPoint.x - 8; // Center the 16px icon
          const iconY = labelPoint.y + 15; // Position below the text
          
          return (
            <View
              key={`icon-${index}`}
              style={[
                styles.iconContainer,
                {
                  left: iconX,
                  top: iconY,
                }
              ]}
            >
              <IconComponent size={16} color="#ffd700" strokeWidth={2} />
            </View>
          );
        })}
      </View>
      
      {/* Balance indicator */}
      <View style={styles.balanceIndicator}>
        <Text style={styles.balanceTitle}>Character Balance</Text>
        <View style={styles.balanceInfo}>
          <View style={[styles.balanceColor, { backgroundColor: chartColor }]} />
          <Text style={styles.balanceText}>
            {range === 0 ? 'Perfect Balance' :
             range <= 10 ? 'Well Balanced' :
             range <= 20 ? 'Moderately Balanced' :
             range <= 30 ? 'Some Imbalance' :
             'Highly Specialized'}
          </Text>
        </View>
        <Text style={styles.balanceDescription}>
          Range: {range} points ({minValue} - {maxValue})
        </Text>
      </View>
      
      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Attribute Values</Text>
        <View style={styles.legendGrid}>
          {attributes.map((attr, index) => {
            const isHighest = attr.value === maxValue;
            const isLowest = attr.value === minValue;
            const IconComponent = getAttributeIcon(attr.id);
            return (
              <View key={attr.id} style={styles.legendItem}>
                <View style={styles.legendIcon}>
                  <IconComponent size={14} color="#ffd700" />
                </View>
                <View style={styles.legendTextContainer}>
                  <Text style={styles.legendText}>
                    {attr.name}
                  </Text>
                </View>
                <View style={styles.legendValue}>
                  <Text style={styles.legendValueText}>
                    <Text style={styles.valueNumber}>{attr.value}</Text>
                    {isHighest && <Text style={styles.highestArrow}> ↑</Text>}
                    {isLowest && <Text style={styles.lowestArrow}> ↓</Text>}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  chartContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  svgChart: {
    // No additional styles needed
  },
  iconContainer: {
    position: 'absolute',
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceIndicator: {
    marginTop: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  balanceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffd700',
    marginBottom: 8,
  },
  balanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  balanceColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  balanceText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  balanceDescription: {
    fontSize: 12,
    color: '#bbb',
  },
  legend: {
    width: '100%',
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#ffd700',
    textAlign: 'center',
    marginBottom: 12,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '48%',
    marginBottom: 8,
    backgroundColor: 'transparent',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ffd700',
  },
  legendIcon: {
    width: 20,
    alignItems: 'flex-start',
  },
  legendTextContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#bbb',
    textAlign: 'center',
  },
  legendValue: {
    width: 30,
    alignItems: 'center',
  },
  legendValueText: {
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: 12,
    gap: 2,
  },
  valueNumber: {
    color: '#ffd700',
    fontWeight: '600',
    fontSize: 12,
  },
  highestArrow: {
    color: '#4ade80',
    fontWeight: '600',
    fontSize: 12,
    fontWeight: '600',
  },
  lowestArrow: {
    color: '#f87171',
    fontWeight: '600',
    fontSize: 12,
    fontWeight: '600',
  },
});