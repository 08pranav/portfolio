import { defineField, type BooleanRule, type StringRule, type TextRule } from "sanity";

type Common = {
  group?: string;
  required?: boolean;
  initialValue?: string;
  readOnly?: boolean;
};
type Limits = { max?: number; min?: number };

const withLimit = (description: string, max?: number) => (max ? `${description} Up to ${max} characters.` : description);

/** Short single-line text. Pass `max` where the layout would break if it ran longer. */
export const str = (name: string, title: string, description: string, o: Common & Limits = {}) =>
  defineField({
    name,
    title,
    type: "string",
    group: o.group,
    description: withLimit(description, o.max),
    initialValue: o.initialValue,
    readOnly: o.readOnly,
    validation: (rule: StringRule) => {
      const rules = [];
      if (o.required) rules.push(rule.required().error("This field is required."));
      if (o.min) rules.push(rule.min(o.min));
      if (o.max) rules.push(rule.max(o.max).error(`Keep this under ${o.max} characters or it will break the layout.`));
      return rules;
    },
  });

/** Multi-line text. */
export const txt = (name: string, title: string, description: string, o: Common & Limits & { rows?: number } = {}) =>
  defineField({
    name,
    title,
    type: "text",
    rows: o.rows ?? 3,
    group: o.group,
    description: withLimit(description, o.max),
    initialValue: o.initialValue,
    validation: (rule: TextRule) => {
      const rules = [];
      if (o.required) rules.push(rule.required().error("This field is required."));
      if (o.max) rules.push(rule.max(o.max).error(`Keep this under ${o.max} characters or it will break the layout.`));
      return rules;
    },
  });

/** On/off switch. */
export const bool = (name: string, title: string, description: string, o: { group?: string; initialValue?: boolean } = {}) =>
  defineField({
    name,
    title,
    type: "boolean",
    group: o.group,
    description,
    initialValue: o.initialValue ?? true,
    validation: (rule: BooleanRule) => rule,
  });
