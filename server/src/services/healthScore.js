export function calculateBusinessHealthScore({
  customerSatisfaction = 0,
  responseTime = 0,
  invoiceCollection = 0,
  ticketResolution = 0,
  leadConversion = 0,
  meetingMomentum = 0
}) {
  const score = Number((
    customerSatisfaction * 0.28 +
    responseTime * 0.16 +
    invoiceCollection * 0.2 +
    ticketResolution * 0.2 +
    leadConversion * 0.16
  ).toFixed(1));

  return {
    score,
    factors: {
      customerSatisfaction,
      responseTime,
      invoiceCollection,
      leadConversion,
      ticketResolution,
      meetingMomentum
    }
  };
}
