const dayOptions = [
  { label: "Monday", value: "Monday" },
  { label: "Tuesday", value: "Tuesday" },
  { label: "Wednesday", value: "Wednesday" },
  { label: "Thursday", value: "Thursday" },
  { label: "Friday", value: "Friday" },
];

const sharingRequestFormConfig = () => [
  {
    id: "quantity",
    label: "Quantity",
    type: "number",
    // validation: { required: true },
    breakAfter: true,
  },
  {
    id: "slot1Day",
    label: "Slot 1 - Day",
    type: "select",
    options: dayOptions,
    validation: { required: true },
  },
  {
    id: "slot1FromTime",
    label: "From",
    type: "time",
    format: "12hr",
    validation: { required: true },
  },
  {
    id: "slot1ToTime",
    label: "To",
    type: "time",
    format: "12hr",
    validation: { required: true },
    breakAfter: true,
  },

  {
    id: "slot2Day",
    label: "Slot 2 - Day",
    type: "select",
    options: dayOptions,
  },
  {
    id: "slot2FromTime",
    label: "From",
    type: "time",
    format: "12hr",
  },
  {
    id: "slot2ToTime",
    label: "To",
    type: "time",
    format: "12hr",
    breakAfter: true,
  },

  {
    id: "slot3Day",
    label: "Slot 3 - Day",
    type: "select",
    options: dayOptions,
  },
  {
    id: "slot3FromTime",
    label: "From",
    type: "time",
    format: "12hr",
  },
  {
    id: "slot3ToTime",
    label: "To",
    type: "time",
    format: "12hr",
  },
];

export default sharingRequestFormConfig;