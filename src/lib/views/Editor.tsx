import { Fragment, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  useTheme,
  useMediaQuery,
  Typography,
  IconButton,
  Box,
  Paper,
} from "@mui/material";
import { addMinutes, differenceInMinutes } from "date-fns";
import { EditorDatePicker } from "../components/inputs/DatePicker";
import { EditorInput } from "../components/inputs/Input";
import {
  EventActions,
  FieldInputProps,
  FieldProps,
  InputTypes,
  ProcessedEvent,
  SchedulerHelpers,
  EventService,
} from "../types";
import { EditorSelect } from "../components/inputs/SelectInput";
import { arraytizeFieldVal } from "../helpers/generals";
import { SelectedRange } from "../store/types";
import useStore from "../hooks/useStore";
import DeleteRounded from "@mui/icons-material/DeleteRounded";
import { Add } from "@mui/icons-material";

export type StateItem = {
  value: any;
  validity: boolean;
  type: InputTypes;
  config?: FieldInputProps;
};

export type StateEvent = (ProcessedEvent & SelectedRange) | Record<string, any>;

// TODO: create currency formatter
const formatRUB = (value: number) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
  }).format(value);

// TODO: props -> store -> handle
const COMMISSION = 0.9;

const initialState = (fields: FieldProps[], event?: StateEvent): Record<string, StateItem> => {
  const customFields = {} as Record<string, StateItem>;
  for (const field of fields) {
    const defVal = arraytizeFieldVal(field, field.default, event);
    const eveVal = arraytizeFieldVal(field, event?.[field.name], event);

    customFields[field.name] = {
      value: eveVal.value || defVal.value || "",
      validity: field.config?.required ? !!eveVal.validity || !!defVal.validity : true,
      type: field.type,
      config: field.config,
    };
  }

  // TODO: group sections
  // TODO: change order
  return {
    event_id: {
      value: event?.event_id || null,
      validity: true,
      type: "hidden",
    },
    confirmed: {
      value: event?.confirmed || null,
      validity: true,
      type: "hidden",
    },
    clientName: {
      value: event?.clientName || "",
      validity: !!event?.clientName,
      type: "input",
      config: { label: "ФИО", title: "Данные клиента", required: true, min: 3 },
    },
    clientPhone: {
      value: event?.clientPhone || "",
      validity: !!event?.clientPhone,
      type: "input",
      config: { label: "Телефон", required: true, min: 3 },
    },
    start: {
      value: event?.start || new Date(),
      validity: true,
      type: "date",
      config: { label: "Start", sm: 6 },
    },
    end: {
      value: event?.end || new Date(),
      validity: true,
      type: "date",
      config: { label: "End", sm: 6 },
    },
    comment: {
      value: event?.comment || "",
      validity: !!event?.comment,
      type: "textarea",
      config: { title: "Комментарий" },
    },
    totalPrice: {
      value: event?.totalPrice || 0,
      validity: !!event?.totalPrice,
      type: "currency",
      config: { title: "Сумма к оплате", titleInline: true },
    },
    totalIncome: {
      value: event?.totalIncome || 0,
      validity: !!event?.totalIncome,
      type: "currency",
      config: { title: "Доход мастера", titleInline: true },
    },
    ...customFields,
  };
};

const Editor = () => {
  const {
    fields,
    dialog,
    triggerDialog,
    selectedRange,
    selectedEvent,
    resourceFields,
    selectedResource,
    triggerLoading,
    onConfirm,
    customEditor,
    confirmEvent,
    dialogMaxWidth,
    translations,
    services,
  } = useStore();
  const [state, setState] = useState(initialState(fields, selectedEvent || selectedRange));
  const [touched, setTouched] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const serviceDefault = { id_service: undefined as any, amount: 0, priceOne: 5, priceTotal: 0 };
  const [servicesState, setSevicesState] = useState(
    selectedEvent?.services || [{ ...serviceDefault }]
  );

  const handleEditorState = (name: string, value: any, validity: boolean) => {
    setState((prev) => {
      return {
        ...prev,
        [name]: { ...prev[name], value, validity },
      };
    });
  };

  const handleServiceState = (
    index: number,
    key: string,
    value: string | number,
    isValid: boolean
  ) => {
    const newServices = [...servicesState];
    // @ts-ignore
    newServices[index][key] = value;

    if (["amount", "priceOne"].includes(key)) {
      newServices[index].priceTotal = newServices[index].amount * newServices[index].priceOne;

      const totalPrice = newServices.reduce((sum, el) => sum + el.priceTotal, 0);
      handleEditorState("totalPrice", totalPrice, !!totalPrice);
      handleEditorState("totalIncome", totalPrice * COMMISSION, !!totalPrice);
    }
    setSevicesState(newServices);
  };
  const handleServiceAdd = () => {
    setSevicesState([...servicesState, { ...serviceDefault }]);
  };
  const handleServiceDelete = (index: number) => {
    const newServices = [...servicesState];
    newServices.splice(index, 1);
    setSevicesState(newServices);
  };

  const handleClose = (clearState?: boolean) => {
    if (clearState) {
      setState(initialState(fields));
    }
    triggerDialog(false);
  };

  const handleSave = async (confirm = false) => {
    let body = {} as ProcessedEvent;
    for (const key in state) {
      body[key] = state[key].value;
      if (!customEditor && !state[key].validity) {
        return setTouched(true);
      }
    }
    try {
      triggerLoading(true);
      if (confirm) body.confirmed = true;
      // Auto fix date
      body.end =
        body.start >= body.end
          ? addMinutes(body.start, differenceInMinutes(selectedRange?.end!, selectedRange?.start!))
          : body.end;
      // Specify action
      const action: EventActions = selectedEvent?.event_id ? "edit" : "create";
      // Trigger custom/remote when provided
      if (onConfirm) {
        body = await onConfirm(body, action);
      } else {
        // Create/Edit local data
        body.event_id =
          selectedEvent?.event_id || Date.now().toString(36) + Math.random().toString(36).slice(2);
        body[resourceFields.idField] = selectedResource;
        body.services = servicesState;
      }

      confirmEvent(body, action);
      handleClose(true);
    } catch (error) {
      console.error(error);
    } finally {
      triggerLoading(false);
    }
  };

  const renderInputs = (key: string) => {
    const stateItem = state[key];
    switch (stateItem.type) {
      case "input":
        return (
          <EditorInput
            value={stateItem.value}
            name={key}
            onChange={handleEditorState}
            touched={touched}
            {...stateItem.config}
            label={translations.event[key] || stateItem.config?.label}
          />
        );
      case "textarea":
        return (
          <EditorInput
            value={stateItem.value}
            name={key}
            multiline={true}
            onChange={handleEditorState}
            touched={touched}
            {...stateItem.config}
            label={translations.event[key] || stateItem.config?.label}
          />
        );
      case "date":
        return (
          <EditorDatePicker
            value={stateItem.value}
            name={key}
            onChange={(...args) => handleEditorState(...args, true)}
            touched={touched}
            {...stateItem.config}
            label={translations.event[key] || stateItem.config?.label}
          />
        );
      case "select":
        const field = fields.find((f) => f.name === key);
        return (
          <EditorSelect
            value={stateItem.value}
            name={key}
            options={field?.options || []}
            onChange={handleEditorState}
            touched={touched}
            {...stateItem.config}
            label={translations.event[key] || stateItem.config?.label}
          />
        );
      case "currency":
        return (
          <Typography variant="body1">
            {stateItem.validity ? formatRUB(stateItem.value) : "-"}
          </Typography>
        );
      default:
        return "";
    }
  };

  const renderServices = () => {
    return (
      <>
        <Typography variant="body1" margin={2} marginBottom={0} width={"100%"}>
          {"Информация об услуге"}
        </Typography>
        {servicesState.map((item: EventService, i: number) => {
          return renderService(item, i);
        })}
        <Box width="100%">
          <Button
            color="inherit"
            onClick={() => handleServiceAdd()}
            startIcon={<Add />}
            sx={{ margin: 2, background: theme.palette.grey["200"] }}
          >
            {"Добавить услугу"}
          </Button>
        </Box>
      </>
    );
  };

  const renderService = (service: EventService, i: number) => {
    return (
      <>
        <Grid item key={"id_service"} xs={7}>
          <EditorSelect
            value={service.id_service}
            name={"id_service"}
            options={services || []}
            onChange={(name, value, isValid) =>
              handleServiceState(i, name, isValid ? Number(value) : value, isValid)
            }
            required={true}
            touched={touched}
            label={"Выберите услугу"}
          />
        </Grid>
        <Grid item key={"amount"} xs={2}>
          <EditorInput
            value={service.amount.toString()}
            name={"amount"}
            onChange={(name, value, isValid) =>
              handleServiceState(i, name, isValid ? Number(value) : value, isValid)
            }
            required={true}
            touched={touched}
            decimal={true}
          />
        </Grid>
        <Grid item key={"price"} xs={2}>
          <EditorInput
            value={formatRUB(service.priceTotal)}
            name={"price"}
            onChange={() => {}}
            touched={touched}
            disabled={true}
          />
        </Grid>
        <Grid item key={"price"} xs={1} alignContent={"center"}>
          <IconButton size={"large"} style={{ padding: 10 }} onClick={() => handleServiceDelete(i)}>
            <DeleteRounded />
          </IconButton>
        </Grid>
      </>
    );
  };

  const renderEditor = () => {
    if (customEditor) {
      const schedulerHelpers: SchedulerHelpers = {
        state,
        close: () => triggerDialog(false),
        loading: (load) => triggerLoading(load),
        edited: selectedEvent,
        onConfirm: confirmEvent,
        [resourceFields.idField]: selectedResource,
      };
      return customEditor(schedulerHelpers);
    }

    return (
      <Fragment>
        {/*<DialogTitle>*/}
        {/*  {selectedEvent ? translations.form.editTitle : translations.form.addTitle}*/}
        {/*</DialogTitle>*/}
        <DialogContent style={{ overflowX: "hidden" }}>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            {state.confirmed.value && (
              <Paper sx={{ background: "#B3BDFD", marginLeft: "auto", padding: "0.2rem 3rem" }}>
                {"Запись подтверждена"}
              </Paper>
            )}
          </Box>
          <Grid
            container
            spacing={2}
            sx={{ pointerEvents: state.confirmed.value ? "none" : "all" }}
          >
            {Object.keys(state).map((key) => {
              const item = state[key];
              return (
                <>
                  <Grid
                    item
                    key={key}
                    sm={item.config?.sm}
                    xs={12}
                    display={item.config?.titleInline ? "flex" : "block"}
                  >
                    {item.config?.title && (
                      <Typography
                        variant="body1"
                        marginRight={item.config?.titleInline ? 2 : 0}
                        marginBottom={1}
                      >
                        {item.config?.title}
                      </Typography>
                    )}
                    {renderInputs(key)}
                  </Grid>
                  {key === "end" && renderServices()}
                </>
              );
            })}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ gap: 3, margin: 2 }}>
          {!state.confirmed.value && (
            <Button
              fullWidth
              onClick={() => handleSave()}
              color={"inherit"}
              sx={{ background: "#FFCB00" }}
            >
              {"Сохранить"}
            </Button>
          )}
          {!state.confirmed.value && (
            <Button
              fullWidth
              onClick={() => handleSave(true)}
              color={"inherit"}
              sx={{ background: "#1EB44F" }}
            >
              {translations.form.confirm}
            </Button>
          )}
          <Button
            fullWidth
            onClick={() => handleClose()}
            variant={"outlined"}
            color={"inherit"}
            sx={{ borderColor: "lightgray" }}
          >
            {"Выход"}
          </Button>
        </DialogActions>
      </Fragment>
    );
  };

  return (
    <Dialog open={dialog} fullScreen={isMobile} maxWidth={dialogMaxWidth}>
      {renderEditor()}
    </Dialog>
  );
};

export default Editor;
