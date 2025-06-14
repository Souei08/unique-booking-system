import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
  Hr,
  Link,
  Img,
} from "@react-email/components";
import { format } from "date-fns";

interface BookingConfirmationEmailProps {
  bookingData: {
    full_name: string;
    email: string;
    booking_date: string;
    selected_time: string;
    slots: number;
    total_price: number;
    booking_reference_id: string;
    tour_name: string;
    tour_rate: number;
    products: Array<{
      product_name: string;
      product_id: string;
      quantity: number;
      unit_price: number;
    }>;
    slot_details: Array<{ type: string; price: number }>;
    waiver_link: string;
  };
}

export const BookingConfirmationEmail = ({
  bookingData,
}: BookingConfirmationEmailProps) => {
  const {
    full_name,
    booking_date,
    selected_time,
    slots,
    total_price,
    booking_reference_id,
    tour_name,
    tour_rate,
    products = [],
    slot_details = [],
    waiver_link = "",
  } = bookingData;

  const formattedDate = format(new Date(booking_date), "MMMM dd, yyyy");
  const formattedTime = format(
    new Date(`2000-01-01T${selected_time}`),
    "h:mm a"
  );

  const slotsTotal = slot_details.length
    ? slot_details.reduce((sum, slot) => sum + slot.price, 0)
    : slots * tour_rate;

  const productsTotal = products.reduce(
    (sum, p) => sum + p.unit_price * p.quantity,
    0
  );

  const grandTotal = slotsTotal + productsTotal;

  return (
    <Html>
      <Head />
      <Preview>Your booking for {tour_name} is confirmed!</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          {/* ✅ Logo */}
          <Section style={styles.logoContainer}>
            <Img
              alt="Wentech"
              src="https://nuamybopwmunwxwmrzgs.supabase.co/storage/v1/object/public/public-wentech//wentech-logo-latest.png"
              width={150}
              height={150}
              style={{ display: "block", margin: "0 auto" }}
            />
          </Section>

          {/* ✅ Header */}
          <Section style={styles.header}>
            <Heading style={styles.h1}>Your Booking is Confirmed 🎉</Heading>
            <Text style={styles.headerSubtitle}>
              Thank you for choosing Unique Tours!
            </Text>
          </Section>

          {/* ✅ Main Content */}
          <Section style={styles.content}>
            <Text style={styles.greeting}>Hi {full_name},</Text>
            <Text style={styles.paragraph}>
              We’re thrilled to confirm your reservation for{" "}
              <strong>{tour_name}</strong>! Here’s a summary for your records:
            </Text>

            {/* ✅ Booking Summary */}
            <Section style={styles.card}>
              <Text style={styles.sectionTitle}>Booking Summary</Text>
              <Hr style={styles.divider} />

              {/* Reference */}
              <Text
                style={{
                  ...styles.label,
                  textAlign: "center",
                  marginBottom: "8px",
                }}
              >
                Reference Number
              </Text>
              <Text
                style={{
                  ...styles.value,
                  textAlign: "center",
                  fontSize: "20px",
                  color: "#033F65",
                }}
              >
                {booking_reference_id}
              </Text>

              <Hr style={styles.divider} />

              {/* Details Grid */}
              <Row style={styles.rowSpacing}>
                <Column width="50%" style={styles.columnPadding}>
                  <Text style={styles.label}>Tour</Text>
                  <Text style={styles.value}>{tour_name}</Text>
                </Column>
                <Column width="50%" style={styles.columnPadding}>
                  <Text style={styles.label}>Date</Text>
                  <Text style={styles.value}>{formattedDate}</Text>
                </Column>
              </Row>

              <Row style={styles.rowSpacing}>
                <Column width="50%" style={styles.columnPadding}>
                  <Text style={styles.label}>Time</Text>
                  <Text style={styles.value}>{formattedTime}</Text>
                </Column>
                <Column width="50%" style={styles.columnPadding}>
                  <Text style={styles.label}>Guests</Text>
                  <Text style={styles.value}>{slots}</Text>
                </Column>
              </Row>

              <Row style={styles.rowSpacing}>
                <Column width="50%" style={styles.columnPadding}>
                  <Text style={styles.label}>Tour Rate</Text>
                  <Text style={styles.value}>${tour_rate.toFixed(2)}</Text>
                </Column>
                <Column width="50%" style={styles.columnPadding}>
                  <Text style={styles.label}>Total Paid</Text>
                  <Text style={styles.value}>${total_price.toFixed(2)}</Text>
                </Column>
              </Row>
            </Section>

            {/* ✅ Payment Breakdown */}
            {(slot_details.length > 0 || products.length > 0) && (
              <Section style={styles.card}>
                <Text style={styles.sectionTitle}>Payment Breakdown</Text>
                <Hr style={styles.divider} />

                {/* Slots */}
                {slot_details.length > 0 ? (
                  <>
                    {slot_details
                      .reduce(
                        (acc, slot) => {
                          const found = acc.find((s) => s.type === slot.type);
                          if (found) {
                            found.count += 1;
                          } else {
                            acc.push({
                              type: slot.type,
                              price: slot.price,
                              count: 1,
                            });
                          }
                          return acc;
                        },
                        [] as { type: string; price: number; count: number }[]
                      )
                      .map((group, idx) => (
                        <Row key={idx} style={styles.breakdownRow}>
                          <Column>
                            <Text style={styles.breakdownLabel}>
                              {group.type} × {group.count}
                            </Text>
                            <Text style={styles.breakdownValue}>
                              ${(group.price * group.count).toFixed(2)}
                            </Text>
                          </Column>
                        </Row>
                      ))}
                  </>
                ) : (
                  <Row style={styles.breakdownRow}>
                    <Column>
                      <Text style={styles.breakdownLabel}>
                        {tour_name} × {slots}
                      </Text>
                      <Text style={styles.breakdownValue}>
                        ${(tour_rate * slots).toFixed(2)}
                      </Text>
                    </Column>
                  </Row>
                )}

                {/* Add-ons */}
                {products.length > 0 && (
                  <>
                    <Text style={styles.subsectionTitle}>Add-ons</Text>
                    {products.map((product, idx) => (
                      <Row key={idx} style={styles.breakdownRow}>
                        <Column>
                          <Text style={styles.breakdownLabel}>
                            {product.product_name} × {product.quantity}
                          </Text>
                          <Text style={styles.breakdownValue}>
                            $
                            {(product.unit_price * product.quantity).toFixed(2)}
                          </Text>
                        </Column>
                      </Row>
                    ))}
                  </>
                )}

                <Hr style={styles.divider} />

                <Row style={styles.breakdownRow}>
                  <Column>
                    <Text
                      style={{
                        ...styles.breakdownLabel,
                        fontWeight: "700",
                        fontSize: "16px",
                      }}
                    >
                      Grand Total
                    </Text>
                    <Text
                      style={{
                        ...styles.breakdownValue,
                        fontWeight: "700",
                        fontSize: "18px",
                        color: "#033F65",
                      }}
                    >
                      ${grandTotal.toFixed(2)}
                    </Text>
                  </Column>
                </Row>
              </Section>
            )}

            {/* ✅ Next Steps */}
            <Section style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Before You Arrive</Text>
              <Hr style={styles.divider} />
              <Text style={styles.paragraph}>
                📄 <strong>Waiver Form:</strong> Please complete it here:{" "}
                <Link href={waiver_link} style={styles.link}>
                  Complete Waiver
                </Link>
              </Text>
              <Text style={styles.paragraph}>
                ✅ Arrive at least 15 minutes early.
              </Text>
              <Text style={styles.paragraph}>
                📌 Bring a valid ID and this email.
              </Text>
              <Text style={styles.paragraph}>
                For questions, just reply to this email.
              </Text>
            </Section>

            <Section style={styles.closingSection}>
              <Text style={styles.paragraph}>Can’t wait to see you soon!</Text>
              <Text style={styles.footer}>
                Cheers,
                <br />
                The Unique Tours Team
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default BookingConfirmationEmail;

//
// ✅ Styles: updated to match your Tailwind config colors & spacing
//
const styles = {
  main: {
    backgroundColor: "#f0f4f8",
    fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
    padding: "20px 0",
  },
  container: {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    width: "100%",
    maxWidth: "600px",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0,0,0,0.07)",
  },
  logoContainer: {
    textAlign: "center" as const,
    padding: "30px 0 10px",
  },
  header: {
    textAlign: "center" as const,
    padding: "40px 30px",
  },
  h1: {
    fontSize: "36px",
    margin: "0",
    fontWeight: "700",
    color: "#033F65",
  },
  headerSubtitle: {
    fontSize: "16px",
    margin: "8px 0 0",
    color: "#486A80",
  },
  content: {
    padding: "32px 40px",
    backgroundColor: "#ffffff",
  },
  greeting: {
    fontSize: "20px",
    lineHeight: "1.5",
    color: "#033F65",
    fontWeight: "600",
    marginBottom: "16px",
  },
  paragraph: {
    fontSize: "16px",
    lineHeight: "1.7",
    color: "#333",
    margin: "0 0 16px",
  },
  card: {
    margin: "30px 0",
    padding: "24px",
    backgroundColor: "#f9fdfd",
    borderRadius: "8px",
    border: "1px solid #6dc2d8",
  },
  infoSection: {
    margin: "30px 0",
    padding: "24px",
    backgroundColor: "#d5eff6",
    borderRadius: "8px",
    border: "1px solid #a8dce9",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#033F65",
    margin: "0 0 16px",
  },
  subsectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#033F65",
    margin: "24px 0 12px",
  },
  rowSpacing: {
    marginBottom: "20px",
  },
  columnPadding: {
    padding: "0 12px",
  },
  label: {
    fontSize: "12px",
    color: "#486A80",
    margin: "0",
    fontWeight: "500",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  value: {
    fontSize: "16px",
    color: "#033F65",
    fontWeight: "600",
    margin: "4px 0 0",
  },
  breakdownRow: {
    marginBottom: "12px",
  },
  breakdownLabel: {
    fontSize: "14px",
    color: "#486A80",
    margin: "0",
    fontWeight: "500",
  },
  breakdownValue: {
    fontSize: "16px",
    color: "#033F65",
    fontWeight: "600",
    margin: "4px 0 0",
  },
  link: {
    color: "#0bb3d9",
    textDecoration: "underline",
    fontWeight: "500",
  },
  divider: {
    borderColor: "#a8dce9",
    margin: "16px 0",
  },
  closingSection: {
    marginTop: "32px",
    paddingTop: "24px",
    borderTop: "1px solid #a8dce9",
  },
  footer: {
    fontSize: "16px",
    lineHeight: "1.6",
    color: "#666",
    marginTop: "24px",
  },
};
