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
  Filter,
  ForeignKey
} from '@syncfusion/ej2-react-grids';
import { DropDownList } from '@syncfusion/ej2-react-dropdowns';
import { DatePickerComponent } from '@syncfusion/ej2-react-calendars';
import { useTranslation } from 'react-i18next';
import { Client, CreateClientDTO } from '../../services/clientService';
import { Country, getAllCountries } from '../../services/countryService';
import './ClientGrid.css';

interface ClientGridProps {
  clients: Client[];
  onCreateClient?: (data: CreateClientDTO) => Promise<void>;
  onUpdateClient?: (id: number, data: CreateClientDTO) => Promise<void>;
  onDeleteClient?: (id: number) => Promise<void>;
  onClientSelection?: (client: Client) => void;
}

const ClientGrid: React.FC<ClientGridProps> = ({
  clients,
  onCreateClient,
  onUpdateClient,
  onDeleteClient,
  onClientSelection
}) => {
  const { t } = useTranslation();
  const [gridData, setGridData] = useState<Client[]>(clients);
  const [countries, setCountries] = useState<Country[]>([]);

  useEffect(() => {
    setGridData(clients);
  }, [clients]);

  useEffect(() => {
    // Fetch countries for the dropdown
    const fetchCountries = async () => {
      try {
        const data = await getAllCountries();
        setCountries(data);
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };

    fetchCountries();
  }, []);

  const editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: 'Dialog',
    newRowPosition: 'Top',
    showConfirmDialog: true,
    showDeleteConfirmDialog: true
  };

  const filterSettings: FilterSettingsModel = { type: 'Excel' };

  const toolbarOptions: ToolbarItems[] = ['Search', 'Add', 'Edit', 'Delete', 'Update', 'Cancel'];

  const commandOptions: CommandModel[] = [
    { type: 'Edit', buttonOption: { iconCss: 'e-icons e-edit', cssClass: 'e-flat' } },
    { type: 'Delete', buttonOption: { iconCss: 'e-icons e-delete', cssClass: 'e-flat' } },
    { type: 'Save', buttonOption: { iconCss: 'e-icons e-update', cssClass: 'e-flat' } },
    { type: 'Cancel', buttonOption: { iconCss: 'e-icons e-cancel-icon', cssClass: 'e-flat' } }
  ];

  // Country dropdown template
  const countryDropdownTemplate = (props: any) => {
    return (
      <DropDownList
        id="countryId"
        name="countryId"
        dataSource={countries}
        fields={{ text: 'descriptionES', value: 'id' }}
        value={props.countryId}
        placeholder={t('client.selectCountry')}
        change={(e) => {
          props.countryId = e.value;
          // Also update the displayed country name for UI consistency
          const selectedCountry = countries.find(c => c.id === e.value);
          if (selectedCountry) {
            props.countryName = selectedCountry.descriptionES;
          }
        }}
      />
    );
  };

  const actionBegin = (args: ActionEventArgs) => {
    if (args.requestType === 'delete' && onDeleteClient) {
      const data = args.data as Client;
      if (data && data.id) {
        // Let the grid handle the UI update, service call will happen in actionComplete
      }
    }
  };

  const actionComplete = (args: SaveEventArgs) => {
    if (args.requestType === 'save') {
      const data = args.data as Client;

      if (args.action === 'add' && onCreateClient) {
        // Handle new record creation
        const newClient: CreateClientDTO = {
          shortName: data.shortName,
          businessName: data.businessName,
          taxId: data.taxId,
          phone: data.phone,
          email: data.email,
          contact: data.contact || '',
          website: data.website || '',
          additionalNotes: data.additionalNotes || '',
          countryId: data.countryId
        };

        onCreateClient(newClient).catch((error) => {
          console.error('Failed to create client:', error);
        });
      } 
      else if (args.action === 'edit' && onUpdateClient) {
        // Handle record update
        const updatedClient: CreateClientDTO = {
          shortName: data.shortName,
          businessName: data.businessName,
          taxId: data.taxId,
          phone: data.phone,
          email: data.email,
          contact: data.contact || '',
          website: data.website || '',
          additionalNotes: data.additionalNotes || '',
          countryId: data.countryId
        };

        onUpdateClient(data.id, updatedClient).catch((error) => {
          console.error('Failed to update client:', error);
        });
      }
    }

    if (args.requestType === 'delete' && onDeleteClient) {
      const arrData = args.data as Array<Client>;
      const data = arrData[0] as Client;
      
      if (data && data.id) {
        onDeleteClient(data.id).catch((error) => {
          console.error('Failed to delete client:', error);
          // If the delete fails, refresh the grid to restore the deleted item
          setGridData([...clients]);
        });
      }
    }
  };

  // Handle row selection
  const rowSelected = (args: any) => {
    if (args.data && onClientSelection) {
      onClientSelection(args.data);
    }
  };

  return (
    <div className="client-grid-wrapper">
      <GridComponent
        dataSource={gridData}
        allowPaging={true}
        allowSorting={true}
        allowFiltering={true}
        filterSettings={filterSettings}
        pageSettings={{ pageSize: 10 }}
        editSettings={editSettings}
        toolbar={toolbarOptions}
        height="450"
        width="100%"
        actionBegin={actionBegin}
        actionComplete={actionComplete}
        rowSelected={rowSelected}
        selectionSettings={{ type: 'Single' }}
      >
        <ColumnsDirective>
          <ColumnDirective
            field="id"
            headerText="ID"
            width="80"
            textAlign="Right"
            isPrimaryKey={true}
            allowEditing={false}
          />
          <ColumnDirective
            field="shortName"
            headerText={t('client.shortName')}
            width="120"
            validationRules={{ required: true }}
          />
          <ColumnDirective
            field="businessName"
            headerText={t('client.businessName')}
            width="200"
            validationRules={{ required: true }}
          />
          <ColumnDirective
            field="taxId"
            headerText={t('client.taxId')}
            width="120"
            validationRules={{ required: true }}
          />
          <ColumnDirective
            field="phone"
            headerText={t('client.phone')}
            width="150"
            validationRules={{ required: true }}
          />
          <ColumnDirective
            field="email"
            headerText={t('client.email')}
            width="200"
            validationRules={{ required: true, regex: ['^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', t('validation.emailInvalid')] }}
          />
          <ColumnDirective
            field="contact"
            headerText={t('client.contact')}
            width="150"
          />
          <ColumnDirective
            field="website"
            headerText={t('client.website')}
            width="180"
          />
          <ColumnDirective
            field="countryId"
            headerText={t('client.country')}
            width="150"
            editType="dropdownedit"
            edit={{ template: countryDropdownTemplate }}
            foreignKeyValue="descriptionES"
            foreignKeyField="id"
            dataSource={countries}
            validationRules={{ required: true }}
          />
          <ColumnDirective
            field="additionalNotes"
            headerText={t('client.additionalNotes')}
            width="200"
          />
          <ColumnDirective
            headerText={t('common.actions')}
            width="120"
            commands={commandOptions}
          />
        </ColumnsDirective>
        <Inject services={[Page, Edit, Sort, Toolbar, Search, CommandColumn, Filter, ForeignKey]} />
      </GridComponent>
    </div>
  );
};

export default ClientGrid;