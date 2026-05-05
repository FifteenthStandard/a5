import createExternalPageSource from './ExternalPageSourceService';
import { GoogleApiClient } from '../clients/GoogleApiClient';

export const GoogleDriveService = createExternalPageSource('GoogleDriveService', GoogleApiClient);
