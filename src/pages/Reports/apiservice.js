/* eslint-disable prefer-destructuring,no-use-before-define */
import ky from 'ky';
import oneLine from 'common-tags/es/oneLine/oneLine';
import validateNewReport from './test/schemaValidation/validateNewReport';
import { setUpMocking } from './fixtures';

// mock api responses during development if configured
if (process.env.NODE_ENV === 'development' && config.mockReportsApi) {
  setUpMocking();
}

const ROUTE = 'reports';

export async function apiSubmitReport(json) {
  return handleSubmitRequest({ json });
}

export async function apiFetchReports() {
  return handleFetchReports({});
}

// copied from User\apiservice TODO: factor out, de-dupe
async function handleSubmitRequest({ method = 'POST', json = {}, token = false }, respType = 'json') {
  let response = {};
  const headers = token ? { Authorization: `JWT ${token}` } : {};
  try {
    if (respType) {
      response = await ky(`${config.apiUrl}/${ROUTE}`, { method, json, headers })[respType]();
    } else {
      await ky(`${config.apiUrl}/${ROUTE}`, { method, json, headers });
    }
  } catch (e) {
    response.error = await e.response.json();
  }

  return response;
}

async function handleFetchReports({ method = 'GET', token = false }, respType = 'json') {
  let response = {};
  const headers = token ? { Authorization: `JWT ${token}` } : {};
  try {
      response = await ky(`${config.apiUrl}/${ROUTE}`, { method, headers })[respType]();
  } catch (e) {
    response.error = await e.response.json();
  }
  return response;
}

/**
 * TODO: Refactor files and store entry props to use the corrected wording in-code so that less marshalling needs to be done.
 * Takes a newReport store item and restructures it as the API expects the new entity to be formed like.
 * @param newReportObject
 * @returns marshalledNewReportObject
 */
export function marshallNewReportObjectFurSubmit(newReportObject) {
  const obj = {};

  // keep address in root, wrap coords in GeoJSON geometry
  obj.address = newReportObject.location.address;
  obj.geometry = { type: 'Point' };
  const coords = newReportObject.location.lngLat;
  obj.geometry.coordinates = [coords.lng, coords.lat];

  // keep photo and description in top level of object
  obj.description = newReportObject.what.additionalInfo.description;

  // omit base64 prefix in photo string
  let photo = newReportObject.what.additionalInfo.photo;
  if (photo) {
    const BASE64_PREFIXES = ['data:image/jpg;base64,', 'data:image/jpeg;base64,'];
    if (!BASE64_PREFIXES.some(prefix => photo.includes(prefix))) {
      throw new Error(oneLine`Failed to remove base 64 prefix. 
      Expected prefix to be '${BASE64_PREFIXES.join(' or ')}',
      found photo string starts with ${photo.slice(0, photo.indexOf(',') || 25)}`);
    }
    BASE64_PREFIXES.forEach((prefix) => {
      photo = photo.replace(prefix, '');
    });
  }
  obj.photo = photo;

  // keep remaining data under top level node "details"
  obj.details = {};
  obj.details.subject = 'BIKE_STANDS';
  obj.details.number = newReportObject.what.bikestands.bikestandsNeeded;
  obj.details.placement = newReportObject.what.bikestands.bikestandsPlacement;
  obj.details.fee = newReportObject.what.bikestands.paymentReservesBikePark;

  // validate object
  const validationResult = validateNewReport(obj);
  if (validationResult.errors.length) {
    throw new Error(`Marshalled newReport object is not structured as stated in json schema: ${
      validationResult.errors}`);
  }

  return obj;
}
