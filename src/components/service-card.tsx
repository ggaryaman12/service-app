"use client";

import { ServiceAddControl } from "@/components/cart/service-add-control";
import {
  ServiceCardUi,
  type ServiceCardUiProps
} from "@/components/ui/service-card";

type ServiceCardProps = Omit<ServiceCardUiProps, "action">;

export function ServiceCard(props: ServiceCardProps) {
  return (
    <ServiceCardUi
      {...props}
      action={<ServiceAddControl serviceId={props.id} />}
    />
  );
}
