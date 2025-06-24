import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Link,
} from "@react-email/components";
import { format } from "date-fns";

interface ConfirmationEmailTemplateProps {
  bookingData: {
    full_name: string;
    email: string;
    booking_date: string;
    selected_time: string;
    slots: number;
    total_price: number;
    booking_reference_id: string;
    tour_name: string;
    manage_token: string;
    sub_total: number;
    coupon_code: string;
    discount_amount: number;
  };
}

export const ConfirmationEmailTemplate = ({
  bookingData,
}: ConfirmationEmailTemplateProps) => {
  const {
    full_name,
    email,
    booking_date,
    selected_time,
    slots,
    total_price,
    booking_reference_id,
    tour_name,
    manage_token,
    sub_total,
    coupon_code,
    discount_amount,
  } = bookingData;

  const formattedDate = format(new Date(booking_date), "MMMM dd, yyyy");
  const formattedTime = format(
    new Date(`2000-01-01T${selected_time}`),
    "h:mm a"
  );

  const getBookingDetails = (): Array<[string, string | number]> => {
    const details: Array<[string, string | number]> = [
      ["Booking Reference", booking_reference_id],
      ["Tour Name", tour_name],
      ["Tour Date", formattedDate],
      ["Tour Time", formattedTime],
      ["Number of Guests", slots],
      ["Booked By", `${full_name} (${email})`],
    ];

    if (coupon_code) {
      details.push(["Subtotal", `$${sub_total.toFixed(2)}`]);
      details.push(["Promo Code Used", coupon_code]);
      details.push(["Discount Amount", `- $${discount_amount.toFixed(2)}`]);
    }

    details.push(["Total Amount Paid", `$${total_price.toFixed(2)}`]);

    return details;
  };

  const manageLink = `http://localhost:3000/manage-booking?manage_token=${manage_token}`;

  return (
    <Html>
      <Head />
      <Preview>Your booking for {tour_name} is confirmed!</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Section style={styles.logoContainer}>
            <Img
              alt="Logo"
              src="https://nuamybopwmunwxwmrzgs.supabase.co/storage/v1/object/public/public-wentech//wentech-logo-latest.png"
              width={100}
              height={100}
              style={{ display: "block", margin: "0 auto" }}
            />
          </Section>

          <Section>
            <Text style={styles.paragraph}>Dear {full_name},</Text>
            <Text style={styles.paragraph}>
              Thank you for booking your experience with {tour_name}. You can{" "}
              <Link href={manageLink} style={styles.link}>
                manage or review your booking here
              </Link>
              . Below are your booking details:
            </Text>
          </Section>

          {/* ✅ Booking Details */}
          <Section style={styles.section}>
            <Text style={styles.sectionTitle}>Booking Summary</Text>
            {getBookingDetails().map(([label, value]) => (
              <div
                style={{
                  ...styles.detailRow,
                  // add extra margin above Subtotal if coupon exists
                  marginTop:
                    coupon_code && label === "Subtotal" ? "12px" : undefined,
                }}
                key={label}
              >
                <span style={styles.label}>{label}:</span>
                <span style={styles.value}>{value}</span>
              </div>
            ))}
          </Section>

          {/* ✅ Waiver Form */}
          <Section style={styles.section}>
            <Text style={styles.sectionTitle}>Waiver Form</Text>
            <Text style={styles.paragraph}>
              For your safety and enjoyment, please complete our waiver form
              before your tour. You can fill it out online here:{" "}
              <Link href="https://your-waiver-link.com" style={styles.link}>
                Complete Waiver Form
              </Link>
              .
            </Text>
          </Section>

          {/* ✅ Cancellation Policy */}
          <Section style={styles.section}>
            <Text style={styles.sectionTitle}>Cancellation Policy</Text>
            <ul style={styles.list}>
              <li>72-Hour notice - full refund</li>
              <li>48-Hour notice - 50% refund</li>
              <li>24-Hour notice - no refund</li>
            </ul>
            <Text style={styles.detailNote}>
              Booking Cut-off: 2 Hours before the tour start time.
            </Text>
          </Section>

          <Section>
            <Text style={styles.paragraph}>
              If you have any questions, please reply to this email.
            </Text>
            <Text style={styles.paragraph}>
              Reservation Team,
              <br />
              Unique Tours and Rentals Ltd.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ConfirmationEmailTemplate;
const styles = {
  main: {
    backgroundColor: "#f7f7f7",
    fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
    padding: "30px 0",
  },
  container: {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    width: "100%",
    maxWidth: "600px",
    borderRadius: "8px",
    padding: "30px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  },
  logoContainer: {
    textAlign: "center" as const,
    marginBottom: "30px",
  },
  paragraph: {
    fontSize: "15px",
    lineHeight: "1.6",
    color: "#486A80", // weak
    marginBottom: "15px",
  },
  section: {
    margin: "25px 0", // slightly more breathing room
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 0", // more vertical space for readability
    fontSize: "14px",
    lineHeight: "1.5",
    borderBottom: "1px solid #eee", // subtle separator
  },
  label: {
    fontWeight: "bold",
    color: "#033F65", // strong
    marginRight: "8px",
    flexShrink: 0,
  },
  value: {
    color: "#033F65", // strong
    textAlign: "right" as const,
    wordBreak: "break-word" as const,
    flex: "1 1 auto",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#033F65", // strong
    marginBottom: "10px",
  },
  list: {
    paddingLeft: "20px",
    marginBottom: "8px",
    fontSize: "14px",
    color: "#486A80", // weak
  },
  detailNote: {
    fontSize: "14px",
    color: "#486A80", // weak
    marginTop: "8px",
  },
  link: {
    color: "#0bb3d9", // brand
    textDecoration: "underline",
    fontSize: "15px",
  },
};
