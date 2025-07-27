import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Input } from "@chakra-ui/react";

const TaskInput = forwardRef((props, ref) => {
  const [value, setValue] = useState('');
  const inputRef = useRef();

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    clear: () => setValue(''),
    getValue: () => value
  }));

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      borderColor="gray.300"
      focusBorderColor="blue.500"
      {...props}
    />
  );
});

export default TaskInput;
