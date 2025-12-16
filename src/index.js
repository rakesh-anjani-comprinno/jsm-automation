import api, { route } from "@forge/api";
import { CLIENT_DROPDOWN_VALUE, CLIENT_FIELD_NAME, SERVERITY_FIELD_NAME, SEVERITY_DROPDOWN_VALUE } from "./contant.js";
import { adfToPlainText } from "./utitlity.js";

export async function handleIncidentCreation(event, context) {

  try {
    const issueDetails = event.issue
    const issueKey = event.issue.key;
    const projectKey = issueDetails?.fields?.project?.key;
    const summary = issueDetails.fields.summary

    if (isIncident(issueDetails)) {

      const issue = await getIncident(issueKey)
      const descriptionADF = issue?.fields?.description;
      const description = adfToPlainText(descriptionADF)

      await setClientField(issueDetails, description, summary);

      await setSeverityField(issueKey, description, summary);

      console.log(`Successfully processed incident: ${issueKey} under project : ${projectKey}`);
    } else {
      console.log(`Skipping non-INC and non-SRQ issue: ${issueKey} under project : ${projectKey}`);
    }

    return {
      success: true,
      message: `Processed issue ${issueKey}`
    };

  } catch (error) {
    console.error("Error processing issue creation:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

function isIncident(issueDetails) {
  const projectKey = issueDetails?.fields?.project?.key;
  if (projectKey === 'INC' || projectKey === 'SRQ') return true
  // if (projectKey === 'ADP') return true
  // if (projectKey === 'KAN') return true
  return false;
}

async function getIncident(issueKey) {
  try {
    const response = await api.asApp().requestJira(route`/rest/api/3/issue/${issueKey}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      console.error(`Failed to get Incident: ${response.status} ${await response.text()}`);
      return false;
    }
    console.log(`Incident retreive successfully for ${issueKey}`);
    return response.json();
  } catch (error) {
    console.error(`Error : Incident retreive Failer for ${issueKey}:`, error);
    return false;
  }
}

async function setClientField(issueDetails, description, summary) {
  const issueKey = issueDetails.key
  try {
    const clientFieldId = CLIENT_FIELD_NAME;
    let clientValue = getClientValue(description, summary);
    if (clientValue === 'Finfinity' && issueDetails?.fields?.project?.key === "INC") {
      clientValue = 'finfinity'
    }
    if (clientValue) {
      console.log(`Setting client field for ${issueKey} to: ${clientValue}`);
      const response = await api.asApp().requestJira(route`/rest/api/3/issue/${issueKey}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            [clientFieldId]: {
              "value": `${clientValue}`
            }
          }
        })
      });
      if (!response.ok) {
        console.error(`Failed to set client field: ${response.status} ${await response.text()}`);
        return false;
      }
      console.log(`Client field set successfully for ${issueKey}`);
    } else {
      console.log(`clientValue : ${clientValue} value cannot be set in client field for the issue: ${issueKey}`)
    }
    return true;
  } catch (error) {
    console.error(`Error setting client field for ${issueKey}:`, error);
    return false;
  }
}

async function setSeverityField(issueKey, description, summary) {

  try {
    const severityFieldId = SERVERITY_FIELD_NAME;
    const severityValue = getSeverityValue(description, summary)
    if (severityValue) {
      console.log(`Setting severity field for ${issueKey} to: ${severityValue}`);
      const response = await api.asApp().requestJira(route`/rest/api/3/issue/${issueKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            [severityFieldId]: {
              "id": `${severityValue}`
            }
          }
        })
      });
      if (!response.ok) {
        console.error(`Failed to set severity field: ${response.status} ${await response.text()}`);
        return false;
      }
      console.log(`Severity field set successfully for ${issueKey}`);
    } else {
      console.log(`severityValue : ${severityValue} value cannot be set in priority field for the issue: ${issueKey}`)
    }

    return true;
  } catch (error) {
    console.error(`Error setting severity field for ${issueKey}:`, error);
    return false;
  }

}

function getClientValue(description, summary) {
  let clientValue = null;

  if (description.match(/Client = Hivepro/i) ||
    description.match(/Client= Hivepro/i) ||
    description.match(/Client : Hivepro/i) ||
    description.match(/Client: Hivepro/i) ||
    description.includes('851725400300') ||
    description.includes('654654356878') ||
    description.includes('211125602615') ||
    description.includes('730335385408') ||
    description.includes('975050346687') ||
    description.includes('533267424662') ||
    description.includes('189733321771') ||
    description.includes('934743933529') ||
    description.includes('211125567681') ||
    description.includes('058264382206')
  ) {
    clientValue = CLIENT_DROPDOWN_VALUE.Hivepro
  }
  else if (description.match(/Client = Fiery/i) ||
    description.match(/Client= Fiery/i) ||
    description.match(/Client : Fiery/i) ||
    description.match(/Client: Fiery/i) ||
    description.includes('325286727057') ||
    description.includes('304426345117') ||
    description.includes('130303618032')
  ) {
    clientValue = CLIENT_DROPDOWN_VALUE.Fiery
  }
  else if (description.match(/Client = Xposure/i) ||
    description.match(/Client= Xposure/i) ||
    description.match(/Client : Xposure/i) ||
    description.match(/Client: Xposure/i) ||
    description.includes('085341193125') ||
    description.includes('767398110122') ||
    description.includes('098915869641')
  ) {
    clientValue = CLIENT_DROPDOWN_VALUE.Xposure
  }
  else if (description.match(/Client = Lightmetrics/i) ||
    description.match(/Client= Lightmetrics/i) ||
    description.match(/Client : Lightmetrics/i) ||
    description.match(/Client: Lightmetrics/i) ||
    description.includes('175309355608') ||
    description.includes('905418003573') ||
    description.includes('443314737660') ||

    description.includes('475421081887') ||
    description.includes('600822795276') ||
    description.includes('645147385443') ||
    description.includes('992382824045')
  ) {
    clientValue = CLIENT_DROPDOWN_VALUE.Lightmetrics
  }
  else if (description.match(/Client = boAt/i) ||
    description.match(/Client= boAt/i) ||
    description.match(/Client : boAt/i) ||
    description.match(/Client: boAt/i) ||
    description.includes('485283321199') ||
    description.includes('345594600709') ||
    description.includes('876340267536') ||
    description.includes('018894835103') ||
    description.includes('141287083492')
  ) {
    clientValue = CLIENT_DROPDOWN_VALUE.boAt
  }
  else if (description.match(/Client = Tevico/i) ||
    description.match(/Client= Tevico/i) ||
    description.match(/Client : Tevico/i) ||
    description.match(/Client: Tevico/i) ||
    getSeverityValueForTevicoComprinno(summary) ||
    description.includes('960324207840') ||
    description.includes('602192780151') ||
    description.includes('785975698029') ||
    description.includes('3489637497') ||
    description.includes('814144134536') ||
    description.includes('830251426724') ||
    description.includes('765203683574') ||
    description.includes('767397963858') ||
    description.includes('784559576775') ||
    description.includes('354861872033') ||
    description.includes('312826407014') ||
    description.includes('603700906749') ||
    description.includes('330605896487') ||
    description.includes('390402553089') ||
    description.includes('797314403042') ||
    description.includes('129424854820') ||
    description.includes('490097793962') ||
    description.includes('601311288054') ||
    description.includes('397945103609') ||
    description.includes('956059115090') ||
    description.includes('830603989224') ||
    description.includes('865246394951') ||
    description.includes('557505809693') ||
    description.includes('762347076265') ||
    description.includes('78245654329') ||
    description.includes('886481146860') ||
    description.includes('250693123083') ||
    description.includes('785880929226')
  ) {
    clientValue = CLIENT_DROPDOWN_VALUE["Tevico/Comprinno"]
  } else if (description.match(/Client = Propertyshare/i) ||
    description.match(/Client= Propertyshare/i) ||
    description.match(/Client : Propertyshare/i) ||
    description.match(/Client: Propertyshare/i) ||
    description.includes('575108963211') ||
    description.includes('600010032587') ||
    description.includes('438224441959') ||
    description.includes('841612248945') ||
    description.includes('235917090123')
  ) {
    clientValue = CLIENT_DROPDOWN_VALUE.Propertyshare
  }
  else if (description.match(/Client = Indxx/i) ||
    description.match(/Client= Indxx/i) ||
    description.match(/Client : Indxx/i) ||
    description.match(/Client: Indxx/i) ||
    description.includes('936668731522') ||
    description.includes('251923122923') ||
    description.includes('888150388431') ||
    description.includes('845131030826') ||
    description.includes('478695634477') ||
    description.includes('481665119819')
  ) {
    clientValue = CLIENT_DROPDOWN_VALUE.Indxx
  }
  else if (description.match(/Client = finfinity/i) ||
    description.match(/Client= finfinity/i) ||
    description.match(/Client : finfinity/i) ||
    description.match(/Client: finfinity/i) ||
    description.includes('148761667238') ||
    description.includes('340752796885') ||
    description.includes('992382357954') ||
    description.includes('851725323968')
  ) {
    clientValue = CLIENT_DROPDOWN_VALUE.Finfinity
  } else if (
    description.match(/Client = Fiery-enterprise/i) ||
    description.match(/Client= Fiery-enterprise/i) ||
    description.match(/Client : Fiery-enterprise/i) ||
    description.match(/Client: Fiery-enterprise/i)
  ) {
    clientValue = CLIENT_DROPDOWN_VALUE["Fiery-enterprise"]
  }
  return clientValue
}

function getSeverityValue(description, summary) {
  if (!description && !summary) return null;

  if (summary && summary.includes(/AWS Budgets/i) && summary.includes(/AWS Cost Management/i)) {
    return SEVERITY_DROPDOWN_VALUE.High
  }

  if (!description) return null;
  const lowerDescription = description.toLowerCase();

  if (containsSeverity(lowerDescription, 'critical')) {
    return SEVERITY_DROPDOWN_VALUE.Highest;
  } else if (containsSeverity(lowerDescription, 'high')) {
    return SEVERITY_DROPDOWN_VALUE.High;
  } else if (containsSeverity(lowerDescription, 'medium')) {
    return SEVERITY_DROPDOWN_VALUE.Medium;
  } else if (containsSeverity(lowerDescription, 'low')) {
    return SEVERITY_DROPDOWN_VALUE.Low;
  } else if (containsSeverity(lowerDescription, 'lowest')) {
    return SEVERITY_DROPDOWN_VALUE.Lowest
  }
  return null;
}

function getSeverityValueForTevicoComprinno(subject) {
  if (subject.match(/mongodb/i)) {
    return true
  }
  return false
}

function containsSeverity(description, severityLevel) {
  const patterns = [
    'severity=',
    'severity =',
    'severity:',
    'severity :'
  ];
  for (const pattern of patterns) {
    const extractedValue = substringBetween(description, pattern, '\n');
    if (extractedValue && extractedValue.toLowerCase().includes(severityLevel)) {
      return true;
    }
  }

  return false;
}

function substringBetween(str, start, end) {
  if (!str || !start) return null;

  const regexStart = new RegExp(start, 'i')
  const startIndex = str.search(regexStart);
  if (startIndex === -1) return null;

  const valueStart = startIndex + start.length;
  const endIndex = end ? str.indexOf(end, valueStart) : str.length;

  if (endIndex === -1) {
    return str.substring(valueStart).trim();
  }

  return str.substring(valueStart, endIndex).trim();
}