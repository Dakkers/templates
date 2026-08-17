import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Card, Flex, Grid, Text } from "@saintly-software/baritone";
import { Page } from "#/components/Page";
import { q } from "#/lib/queries";
import { Check as CheckIcon } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(q.items()),
  component: DashboardPage,
});

function DashboardPage() {
  const { data: items } = useSuspenseQuery(q.items());
  const done = items.filter((item) => item.done).length;

  return (
    <Page
      title="Dashboard"
      subtitle="An at-a-glance view, fetched on the server and hydrated on the client."
    >
      <Flex direction="column" gap="6">
        <Grid columns={2} gap="4">
          <Card saliency="low" header={String(items.length)} subheader="Total items" />
          <Card saliency="low" header={`${done} / ${items.length}`} subheader="Completed" />
        </Grid>

        <Flex direction="column" gap="2">
          {items.map((item) => (
            <Card key={item.id} saliency="low">
              <Flex align="center" justify="between" gap="3">
                <Flex align="center" gap="2" minWidth='0'>
                  {item.done && <CheckIcon size={16} aria-label="Done" />}
                  <Text>
                    {item.title}
                  </Text>
                </Flex>
                <Text variant="sm" saliency="low">
                  {item.done ? "Done" : "Open"}
                </Text>
              </Flex>
            </Card>
          ))}
        </Flex>
      </Flex>
    </Page>
  );
}
