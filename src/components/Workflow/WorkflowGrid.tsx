import React, { useState, useEffect } from 'react';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Page,
  Edit,
  Sort,
  Inject,
  Toolbar,
  Search,
  CommandColumn,
  EditSettingsModel,
  SaveEventArgs,
  ActionEventArgs,
  ToolbarItems,
  CommandModel,
  FilterSettingsModel,
  Filter
} from '@syncfusion/ej2-react-grids';
import { useTranslation } from 'react-i18next';
import './WorkflowGrid.css';
import {loadCldr, L10n} from '@syncfusion/ej2-base';
import * as numberingSystems from '@syncfusion/ej2-cldr-data/supplemental/numberingSystems.json';
import * as gregorian from '@syncfusion/ej2-cldr-data/main/es/ca-gregorian.json';
import * as numbers from '@syncfusion/ej2-cldr-data/main/es/numbers.json';
import * as timeZoneNames from '@syncfusion/ej2-cldr-data/main/es/timeZoneNames.json';

import gridLanguage from '../../locales/syncfusion-components/grid.json';

L10n.load(gridLanguage);
loadCldr(numberingSystems, gregorian, numbers, timeZoneNames);


interface ProcessType {
  id: number;
  description: string;
  averageDuration: number | null;
  state: boolean;
}

interface WorkflowGridProps {
  processTypes: ProcessType[];
  onCreateProcessType?: (data: Omit<ProcessType, 'id'>) => Promise<void>;
  onUpdateProcessType?: (data: ProcessType) => Promise<void>;
  onDeleteProcessType?: (id: number) => Promise<void>;
  onProcessSelection?: (process: ProcessType) => void;
}

const WorkflowGrid: React.FC<WorkflowGridProps> = ({
  processTypes,
  onCreateProcessType,
  onUpdateProcessType,
  onDeleteProcessType,
  onProcessSelection
}) => {
  const { t, i18n } = useTranslation();
  const [gridData, setGridData] = useState<ProcessType[]>(processTypes);

  useEffect(() => {
    setGridData(processTypes);
  }, [processTypes]);

  const editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: 'Normal',
    newRowPosition: 'Top'
  };

  const filterSettings: FilterSettingsModel = {type: 'Excel'};

  const toolbarOptions: ToolbarItems[] = ['Search', 'Add', 'Edit', 'Delete', 'Update', 'Cancel'];

  const commandOptions: CommandModel[] = [
    { type: 'Edit', buttonOption: { iconCss: 'e-icons e-edit', cssClass: 'e-flat' } },
    { type: 'Delete', buttonOption: { iconCss: 'e-icons e-delete', cssClass: 'e-flat' } },
    { type: 'Save', buttonOption: { iconCss: 'e-icons e-update', cssClass: 'e-flat' } },
    { type: 'Cancel', buttonOption: { iconCss: 'e-icons e-cancel-icon', cssClass: 'e-flat' } }
  ];

  const actionBegin = (args: ActionEventArgs) => {
    if (args.requestType === 'delete' && onDeleteProcessType) {
      const data = args.data as ProcessType;
      if (data && data.id) {
        console.log('deleting...')
        // Don't cancel the action, let the grid handle the UI update
        onDeleteProcessType(data.id).then(() => {}).catch((error) => {
          console.error('Failed to delete process type:', error);
          // If the delete fails, we need to refresh the grid to restore the deleted item
          setGridData([...processTypes]);
        });
      }
    }
  };

  const actionComplete = (args: SaveEventArgs) => {
    if (args.requestType === 'save') {
      const data = args.data as ProcessType;

      if (args.action === 'add' && onCreateProcessType) {
        // Handle new record creation
        const newProcessType = {
          description: data.description,
          averageDuration: data.averageDuration,
          state: data.state || false
        };

        onCreateProcessType(newProcessType).then(() => {
          // The parent component will refresh the grid after successful creation
        }).catch((error) => {
          console.error('Failed to create process type:', error);
        });
      }
      else if (args.action === 'edit' && onUpdateProcessType) {
        // Handle record update
        onUpdateProcessType(data).then(() => {
          // The parent component will refresh the grid after successful update
        }).catch((error) => {
          console.error('Failed to update process type:', error);
        });
      }
    }


    console.log(args.requestType);
    if (args.requestType === 'delete' && onDeleteProcessType) {

      const arrData = args.data as Array<ProcessType>;
      const data = arrData[0] as ProcessType
      console.log('before condition...', data)
      if (data && data.id) {
        console.log('deleting...')
        // Don't cancel the action, let the grid handle the UI update
        onDeleteProcessType(data.id).then(() => {}).catch((error) => {
          console.error('Failed to delete process type:', error);
          // If the delete fails, we need to refresh the grid to restore the deleted item
          setGridData([...processTypes]);
        });
      }
    }


  };

  // Handle row selection
  const rowSelected = (args: any) => {
    if (args.data && onProcessSelection) {
      onProcessSelection(args.data);
    }
  };

  return (
    <div className="workflow-grid-wrapper">
      <GridComponent
        dataSource={gridData}
        allowPaging={true}
        allowSorting={true}
        allowFiltering={true}
        filterSettings={filterSettings}
        pageSettings={{ pageSize: 10 }}
        editSettings={editSettings}
        toolbar={toolbarOptions}
        height="350"
        width="100%"
        actionBegin={actionBegin}
        actionComplete={actionComplete}
        rowSelected={rowSelected}
        selectionSettings={{ type: 'Single' }}
        locale={i18n.language}
      >
        <ColumnsDirective>
          <ColumnDirective
            field="id"
            headerText="ID"
            width="100"
            textAlign="Center"
            isPrimaryKey={true}
            allowEditing={false}

          />
          <ColumnDirective
            field="description"
            headerText={t('workflow.description')}
            width="200"
            validationRules={{ required: true }}
            textAlign="Left"
          />
          <ColumnDirective
            field="averageDuration"
            headerText={t('workflow.averageDuration')}
            width="150"
            format="N2"
            textAlign="Center"
            editType='numericedit'
          />
          <ColumnDirective
            field="state"
            headerText={t('workflow.state')}
            width="100"
            type="boolean"
            textAlign="Center"
            displayAsCheckBox={true}
            editType='booleanedit'
          />
          <ColumnDirective
            headerText={t('common.actions')}
            width="150"
            commands={commandOptions}
          />
        </ColumnsDirective>
        <Inject services={[Page, Edit, Sort, Toolbar, Search, CommandColumn, Filter]} />
      </GridComponent>
    </div>
  );
};

export default WorkflowGrid;