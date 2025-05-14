import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ScheduleComponent, Day, Week, WorkWeek, Month, Agenda, Inject, ViewsDirective, ViewDirective, PopupOpenEventArgs, ActionEventArgs } from '@syncfusion/ej2-react-schedule';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-buttons/styles/material.css';
import '@syncfusion/ej2-calendars/styles/material.css';
import '@syncfusion/ej2-dropdowns/styles/material.css';
import '@syncfusion/ej2-inputs/styles/material.css';
import '@syncfusion/ej2-lists/styles/material.css';
import '@syncfusion/ej2-navigations/styles/material.css';
import '@syncfusion/ej2-popups/styles/material.css';
import '@syncfusion/ej2-splitbuttons/styles/material.css';
import '@syncfusion/ej2-react-schedule/styles/material.css';
import Layout from '../components/Layout/Layout';
import TimeRegistryForm from '../components/TimeRegistry/TimeRegistryForm';
import './Scheduler.css';
import {loadCldr, L10n, closest} from '@syncfusion/ej2-base';
import * as numberingSystems from '@syncfusion/ej2-cldr-data/supplemental/numberingSystems.json';
import * as gregorian from '@syncfusion/ej2-cldr-data/main/es/ca-gregorian.json';
import * as numbers from '@syncfusion/ej2-cldr-data/main/es/numbers.json';
import * as timeZoneNames from '@syncfusion/ej2-cldr-data/main/es/timeZoneNames.json';
import { getAllTimeEntries, convertTimeEntriesToEvents, TimeEntry, deleteTimeEntry } from '../services/timeEntryService';

import schedulerLanguage from '../locales/syncfusion-components/schedule.json';
import { sliceElements } from '@syncfusion/ej2-react-grids';

L10n.load(schedulerLanguage);
loadCldr(numberingSystems, gregorian, numbers, timeZoneNames);

const Scheduler: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scheduleRef = useRef<ScheduleComponent>(null);

  // Fetch time entries
  const fetchTimeEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllTimeEntries();
      setTimeEntries(data);
    } catch (err) {
      console.error('Error fetching time entries:', err);
      setError('Failed to load time entries');
    } finally {
      setLoading(false);
    }
  };

  // Initial load of time entries
  useEffect(() => {
    fetchTimeEntries();
  }, []);

  // Convert time entries to schedule events
  const scheduleEvents = convertTimeEntriesToEvents(timeEntries);

  // Event template customization
  const eventTemplate = (props: any) => {
    return (
      <div className="schedule-event-template">
        <div className="event-subject">{props.Subject}</div>
        {props.ClientName && <div className="event-client">Client: {props.ClientName}</div>}
        {props.MatterName && <div className="event-matter">Matter: {props.MatterName}</div>}
      </div>
    );
  };

  // Handle time entry creation
  const handleTimeEntryCreated = () => {
    fetchTimeEntries();
    if (scheduleRef.current) {
      scheduleRef.current.refreshEvents();
    }
  };

  // Handle popup opening - remove edit button and customize popup
  const onPopupOpen = (args: PopupOpenEventArgs) => {

    console.log(args);
    if (args.type === 'Editor' || args.type === 'QuickInfo' || args.type === 'DeleteAlert') {
      // This is to prevent the default edit action
      if (args.type === 'QuickInfo') {
        const editButton = args.element.querySelector('.e-edit') as HTMLElement;
        if (editButton) {
          editButton.style.display = 'none'; // Hide edit button
        }

        const selectedAppointment = args.target?.classList.contains('e-appointment-border');

        if (!selectedAppointment) {
          args.cancel = true;
        }


      }

      if (args.type === 'Editor') {
        args.cancel = true;
      }

      // Customize delete button if needed
      if (args.type === 'DeleteAlert') {
      const deleteButton = args.element.querySelector('.e-quick-dialog-delete') as HTMLElement;
      if (deleteButton) {
        // Replace original click handler with custom one
        deleteButton.onclick = (e: MouseEvent) => {
          e.stopPropagation();


          // Get the event data from the clicked event
          const eventElement = closest(e.currentTarget as Element, '.e-appointment');

          const eventId = eventElement ? eventElement.getAttribute('data-id') : null;

          if (eventId) {
            // Your custom delete logic here
            console.log(`Custom delete handler for event ID: ${eventId}`);

            // Example: Show confirmation dialog
            if (window.confirm(t('scheduler.confirmDelete'))) {
              // Call your delete API

              // deleteTimeEntry(eventId).then(() => {
              //   fetchTimeEntries();
              // });

              // Close the popup
              if (scheduleRef.current) {
                scheduleRef.current.closeQuickInfoPopup();
              }
            }
          }
        };
      }
    }
    }
  };

  const onActionBegin = (args: ActionEventArgs): void => {
    if (args.requestType === "eventChange") {
      // Handle the code if "save" button is clicked.
    } else if (args.requestType === "eventRemove") {
      // Handle the code if "save" button is clicked.
      const deletedEntryId = Array.isArray(args.data) ? args.data : [args.data];
      if (deletedEntryId && deletedEntryId.length > 0) {

        deleteTimeEntry(deletedEntryId[0].Id).then( r => { fetchTimeEntries();});
      }
    }
  }

  // Handle action completion (edit, delete, etc.)
  const onActionComplete = (args: ActionEventArgs) => {
    if (args.requestType === 'eventRemoved') {
      // Custom logic after event is deleted
      console.log('Event was deleted:', args.data);

    }
  };

  const renderSchedulerContent = () => {
    if (loading) {
      return (
        <div className="scheduler-container">
          <div className="scheduler-loading">
            <div className="spinner"></div>
            <p>{t('common.loading')}</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="scheduler-container">
          <div className="scheduler-error">
            <p>{error}</p>
            <button onClick={fetchTimeEntries}>{t('common.retry')}</button>
          </div>
        </div>
      );
    }

    return (
      <div className="scheduler-container">
        <ScheduleComponent
          ref={scheduleRef}
          height={'500px'}
          selectedDate={new Date()}
          views={['Month', 'Agenda']}
          eventSettings={{
            dataSource: scheduleEvents,
            template: eventTemplate,
            fields: {
              id: 'Id',
              subject: { name: 'Subject' },
              startTime: { name: 'StartTime' },
              endTime: { name: 'EndTime' }
            }
          }}
          locale={i18n.language}
          showHeaderBar={true}
          enablePersistence={false}
          popupOpen={onPopupOpen}
          actionComplete={onActionComplete}
          actionBegin={onActionBegin}
        >
          <ViewsDirective>
            <ViewDirective option='Month' />
            <ViewDirective option='Agenda' />
          </ViewsDirective>
          <Inject services={[Month, Agenda]} />
        </ScheduleComponent>
      </div>
    );
  };

  return (
    <Layout>
      <div className='scheduler-page-heading'>
        <h1>{t('scheduler.title')}</h1>
      </div>
      <div className='time-registry-container'>
        {renderSchedulerContent()}
        <div className='time-registry-form'>
          <TimeRegistryForm onTimeEntryCreated={handleTimeEntryCreated} />
        </div>
      </div>
    </Layout>
  );
};

export default Scheduler;