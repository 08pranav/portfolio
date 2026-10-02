import { LaunchIcon } from "@sanity/icons/Launch";
import { Button, Card, Flex, Stack, Text } from "@sanity/ui";

/** Studio tool: a one-click way to the live site. */
export default function ViewSite() {
  return (
    <Card padding={5} style={{ height: "100%" }}>
      <Flex align="center" justify="center" style={{ height: "100%" }}>
        <Stack gap={4} style={{ maxWidth: 420, textAlign: "center" }}>
          <Text size={2}>Open the real site in a new tab. For editing with a live preview, use the Presentation tool instead.</Text>
          <Button as="a" href="/" target="_blank" rel="noopener" icon={LaunchIcon} text="Open the site" tone="primary" />
        </Stack>
      </Flex>
    </Card>
  );
}
