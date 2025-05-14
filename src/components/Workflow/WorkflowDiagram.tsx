import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DiagramComponent,
  NodeModel,
  ConnectorModel,
  Inject,
  DiagramTools,
  DataBinding,
  HierarchicalTree,
  Connector,
  PortVisibility,
  Diagram,
  SnapConstraints,
  DiagramConstraints,
  LineRouting,
  ConnectorBridging
} from '@syncfusion/ej2-react-diagrams';
import { getProcessPhasesByProcessTypeId } from '../../services/workflowService';

interface ProcessType {
  id: number;
  description: string;
}

interface ProcessPhase {
  id: number;
  processTypeId: number;
  description: string;
  order: number;
  duration: number | null;
  state: boolean;
  processTypeDescription: string;
}

interface WorkflowDiagramProps {
  selectedProcess: ProcessType | null;
}

const WorkflowDiagram: React.FC<WorkflowDiagramProps> = ({ selectedProcess }) => {
  const { t } = useTranslation();
  const [processPhases, setProcessPhases] = useState<ProcessPhase[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProcessPhases = async () => {
      if (!selectedProcess) {
        setProcessPhases([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const phases = await getProcessPhasesByProcessTypeId(selectedProcess.id);
        // Sort by order to ensure proper sequence
        const sortedPhases = phases.sort((a, b) => a.order - b.order);
        setProcessPhases(sortedPhases);
        console.log(sortedPhases);
      } catch (err) {
        setError(t('workflow.error.loadingPhases'));
        console.error('Error fetching process phases:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProcessPhases();
  }, [selectedProcess, t]);

  let nodes: NodeModel[] = [
    {
      id: 'start', offsetX: 115, offsetY: 110,
      shape: { type: 'Flow', shape: 'Terminator' },
      style: { fill: '#D5535D' },
      ports: [{ id: 'port1', offset: { x: 0.5, y: 0 }, visibility: PortVisibility.Hidden }],
      annotations: [{
        content: 'Start',
        style: { color: 'white' }
      }]
    },
    {
      id: 'process', offsetX: 115, offsetY: 255,
      shape: { type: 'Flow', shape: 'Process' },
      style: { fill: "#65B091" },
      annotations: [{
        content: 'Process',
        style: { color: 'white' }
      }]
    },
    {
      id: 'document', offsetX: 115, offsetY: 400,
      shape: { type: 'Flow', shape: 'Document' },
      style: { fill: "#5BA5F0" },
      ports: [{ id: 'port1', offset: { x: 0, y: 0.5 }, visibility: PortVisibility.Hidden }],
      annotations: [{
        content: 'Document',
        style: { color: 'white' }
      }]
    },
    {
      id: 'decision', offsetX: 390, offsetY: 110,
      shape: { type: 'Flow', shape: 'Decision' },
      style: { fill: "#9A8AF7" },
      annotations: [{
        content: 'Decision',
        style: { color: 'white' }
      }]
    },
    {
      id: 'document2', offsetX: 390, offsetY: 255,
      shape: { type: 'Flow', shape: 'Document' },
      style: { fill: "#5BA5F0" },
      annotations: [{
        content: 'Document',
        style: { color: 'white' }
      }]
    },
    {
      id: 'end', offsetX: 390, offsetY: 400,
      shape: { type: 'Flow', shape: 'Terminator' },
      style: { fill: "#9A8AF7" },
      annotations: [{
        content: 'End',
        style: { color: 'white' }
      }]
    },
    {
      id: 'process2', offsetX: 640, offsetY: 110,
      shape: { type: 'Flow', shape: 'Process' },
      style: { fill: "#65B091" },
      annotations: [{
        content: 'Process',
        style: { color: 'white' }
      }]
    },
    {
      id: 'card', offsetX: 640, offsetY: 255,
      shape: { type: 'Flow', shape: 'Card' },
      style: { fill: "#9A8AF7" },
      annotations: [{
        content: 'Card',
        style: { color: 'white' }
      }],
      ports: [
        { id: 'port1', offset: { x: 1, y: 0.5 }, visibility: PortVisibility.Hidden },
        { id: 'port2', offset: { x: 0.5, y: 1 }, visibility: PortVisibility.Hidden }
      ],
    }
  ];
  //Initialize Diagram Connectors
  let connectors: ConnectorModel[] = [
    {
      id: 'Connector1', sourceID: 'start', targetID: 'process',
    },
    {
      id: 'Connector2', sourceID: 'process', targetID: 'document'
    },
    {
      id: 'Connector3', sourceID: 'document', targetID: 'end',
    },
    {
      id: 'Connector4', sourceID: 'start', targetID: 'decision'
    },
    {
      id: 'Connector5', sourceID: 'decision', targetID: 'process2',
    },
    {
      id: 'Connector6', sourceID: 'process2', targetID: 'card',
    },
    {
      id: 'Connector7', sourceID: 'process', targetID: 'document2'
    },
    {
      id: 'Connector8', sourceID: 'document2', targetID: 'card',
    },
    {
      id: 'Connector9', sourceID: 'start', sourcePortID: "port1",
      targetID: 'card', targetPortID: 'port1'
    },
    {
      id: 'Connector10', sourceID: 'card', sourcePortID: 'port2',
      targetID: 'document', targetPortID: 'port1'
    },
  ];

  const getNodes = (): NodeModel[] => {

    let indexOfLine = 0;
    let maxNodesPerLine = 4;
    let yPosition = 100;


    return processPhases.map((phase, index) => {


      let xPosition = 0; // Position nodes horizontally based on order

      if((index + 1) % maxNodesPerLine == 0 )
      {
        indexOfLine = 0;
        yPosition += 100;
      }
      xPosition = 220 + (indexOfLine * 250);
      indexOfLine++;

      return {
        id: `node-${phase.id}`,
        width: 180,
        height: 60,
        offsetX: xPosition,
        offsetY: yPosition,
        style: {

          fill: phase.state ? '#65B091' : '#65B091', // Green tint for active, red tint for inactive

          strokeWidth: 2,
        },
        shape: { type: 'Flow', shape: 'Process' },
        annotations: [
          {
            content: phase.description,
            style: { color: 'white', bold: true }
          },
          // {
          //   content: phase.duration ? `${phase.duration} ${t('workflow.days')}` : t('workflow.noDuration'),
          //   style: { color: '#666', fontSize: 12 },
          //   offset: { y: 1 }
          // }
        ]
      };
    });
  };

  const getConnectors = (): ConnectorModel[] => {
    const connectors: ConnectorModel[] = [];

    // Create connections between nodes based on order
    for (let i = 0; i < processPhases.length - 1; i++) {
      const currentPhase = processPhases[i];
      const nextPhase = processPhases[i + 1];

      connectors.push({
        id: `connector-${currentPhase.id}-${nextPhase.id}`,
        sourceID: `node-${currentPhase.id}`,
        targetID: `node-${nextPhase.id}`,
        type: 'Orthogonal',
        style: {
          strokeColor: '#ff8c00', // Orange color to match the theme
          strokeWidth: 2,
        },
        targetDecorator: {
          shape: 'Arrow',
          style: {
            fill: '#ff8c00',
            strokeColor: '#ff8c00',
          }
        }
      });
    }

    return connectors;
  };



  let diagramInstance: DiagramComponent;


  function rendereComplete() {
    diagramInstance.fitToPage({ mode: 'Width' });
  }
  // Function to define defaults for nodes in the diagram
  function getNodeDefaults(node: NodeModel): NodeModel {
    node.height = 50; // Default height for nodes
    if (node.id === 'decision') {
      node.height = 70; // Adjust height for specific node with id 'decision'
    }
    node.width = 120; // Default width for nodes
    node.style = { strokeColor: 'transparent' };// Styling for nodes
    return node;
  }

   // Function to define defaults for connectors in the diagram
  function getConnectorDefaults(connector: ConnectorModel): ConnectorModel {
    connector.type = 'Orthogonal';// Connector type (Orthogonal)
    connector.style = { strokeColor: '#707070 ', strokeWidth: 1.25 }; // Connector styling (color and width)
    connector.targetDecorator = { style: { fill: '#707070 ', strokeColor: '#707070 ' } }; // Decorator styling for connectors
    return connector;
  }


  if (!selectedProcess) {
    return (
      <div className="workflow-no-selection">
        {t('workflow.selectProcessToView')}
      </div>
    );
  }

  if (loading) {
    return <div className="workflow-loading">{t('common.loading')}</div>;
  }

  if (error) {
    return <div className="workflow-error">{error}</div>;
  }

  if (processPhases.length === 0) {
    return (
      <div className="workflow-no-selection">
        {t('workflow.noPhases')}
      </div>
    );
  }

  return (
    <div className="workflow-diagram-content">
      <DiagramComponent
              id="diagram"
              ref={(diagram: DiagramComponent | null) => {
                if (diagram) {
                  diagramInstance = diagram;
                }
              }}
              width={"100%"}
              height={"300px"}

              snapSettings={{ constraints: SnapConstraints.None }}
              constraints={DiagramConstraints.Default | DiagramConstraints.LineRouting | DiagramConstraints.Bridging }
              nodes={getNodes()}
              connectors={getConnectors()}
              getConnectorDefaults={getConnectorDefaults}
              getNodeDefaults={getNodeDefaults}
            >
              <Inject services={[LineRouting, ConnectorBridging]} />
            </DiagramComponent>
    </div>
  );
};

export default WorkflowDiagram;