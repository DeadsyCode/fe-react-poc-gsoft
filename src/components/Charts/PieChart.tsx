import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  AccumulationChartComponent,
  AccumulationSeriesCollectionDirective,
  AccumulationSeriesDirective,
  PieSeries,
  AccumulationLegend,
  AccumulationTooltip,
  AccumulationDataLabel,
  Inject
} from '@syncfusion/ej2-react-charts';

export interface PieChartData {
  x: string;
  y: number;
}

interface PieChartProps {
  title: string;
  data: PieChartData[];
  height?: string;
  width?: string;
  innerRadius?: string;
  showLabels?: boolean;
  legendPosition?: 'Auto' | 'Top' | 'Bottom' | 'Left' | 'Right' | 'Custom';
}

const PieChart: React.FC<PieChartProps> = ({
  title,
  data,
  height = '100%',
  width = '100%',
  innerRadius = '0%',
  showLabels = true,
  legendPosition = 'Bottom'
}) => {
  const { t } = useTranslation();

  // Vibrant color palette for pie charts
  // These colors are chosen to work well in both light and dark themes
  // They have sufficient contrast and vibrance for visual distinction
  const vibrantPalette = [
    '#FF6B6B', // Bright red
    '#4ECDC4', // Turquoise
    '#FF8C42', // Orange
    '#6A67CE', // Purple
    '#2EC4B6', // Teal
    '#FFBF00', // Amber
    '#E63946', // Imperial red
    '#06D6A0', // Caribbean green
    '#118AB2', // Blue
    '#FB5607', // Safety orange
    '#F72585', // Barbie pink
    '#7B2CBF', // Purple (darker)
    '#4CC9F0', // Vivid sky blue
    '#FFC6FF', // Light pink
    '#CAFFBF'  // Light green
  ];

  // Theme handling for charts
  const loadChart = (args: any) => {
    let selectedTheme = location.hash.split('/')[1];
    selectedTheme = selectedTheme ? selectedTheme : 'Material';
    
    if (args.accumulation) {
      args.accumulation.theme = (selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1))
        .replace(/contrast/i, 'Contrast')
        .replace(/-dark/i, "Dark");
    }
  };

  return (
    <div className="chart-container" style={{ height, width }}>
      <h3 className="chart-title">{title}</h3>
      {data.length > 0 ? (
        <AccumulationChartComponent
          id={`pie-chart-${title.replace(/\s+/g, '-').toLowerCase()}`}
          tooltip={{ enable: true }}
          legendSettings={{ visible: true, position: legendPosition }}
          enableSmartLabels={true}
          enableAnimation={true}
          palettes={vibrantPalette}
          load={loadChart}
        >
          <Inject services={[AccumulationLegend, PieSeries, AccumulationTooltip, AccumulationDataLabel]} />
          <AccumulationSeriesCollectionDirective>
            <AccumulationSeriesDirective
              dataSource={data}
              xName='x'
              yName='y'
              innerRadius={innerRadius}
              dataLabel={{
                visible: showLabels,
                name: 'text',
                position: 'Inside',
                font: {
                  fontWeight: '600',
                  color: '#ffffff',
                  size: '12px'
                }
              }}
            />
          </AccumulationSeriesCollectionDirective>
        </AccumulationChartComponent>
      ) : (
        <div className="no-data">
          <p>{t('common.noData')}</p>
        </div>
      )}
    </div>
  );
};

export default PieChart;