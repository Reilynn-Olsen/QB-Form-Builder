import React, { useState } from 'react';
import './FormBuilder.css';

//types
interface BaseForm {
  label: string;
  required: boolean;
  default: string;
}
interface FormData extends BaseForm {
  choices: string;
  displayAlpha: 'alphabetical' | 'notAlphabetical';
}
interface JsonData extends BaseForm {
  choices: string[];
  displayAlpha: boolean;
}

//utility functions
const isFormObjectKey = (value: any): value is keyof FormData =>
  ['label', 'required', 'choices', 'displayAlpha', 'default'].includes(value);

const arrayContainsDuplicates = (array: any[]): boolean =>
  array.length !== new Set(array).size;

function formatJSON(form: FormData): JsonData {
  const choicesArray = form.choices.split('\n');
  return {
    label: form.label,
    required: form.required,
    choices:
      choicesArray.includes(form.default) || form.default.trim().length <= 0
        ? choicesArray
        : [...choicesArray, form.default],
    displayAlpha: form.displayAlpha === 'alphabetical' ? true : false,
    default: form.default,
  };
}

function validateForm(formJSON: JsonData): boolean {
  if (!formJSON.label) {
    alert('Error: Label Field is Required');
  } else if (arrayContainsDuplicates(formJSON.choices)) {
    alert('Error: Duplicate Choices');
  } else if (formJSON.choices.length > 50) {
    alert('Error: Max choices of 50 exceeded');
  } else {
    return true;
  }
  return false;
}

const initialForm = {
  label: '',
  required: false,
  choices: '',
  displayAlpha: 'alphabetical',
  default: '',
} as const;

function FormBuilder() {
  const [form, setForm] = useState<FormData>(initialForm);

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ): void => {
    const formName = e.target.getAttribute('name');
    if (formName === 'required') {
      setForm((prevState) => ({ ...prevState, required: !prevState.required }));
    } else if (isFormObjectKey(formName)) {
      setForm((prevState) => ({ ...prevState, [formName]: e.target.value }));
    } else {
      throw Error(`Error: ${formName} is not a key of ${form}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    const jsonData = formatJSON(form);
    if (validateForm(jsonData)) {
      const postRequest = await fetch(
        'http://www.mocky.io/v2/566061f21200008e3aabd919',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jsonData),
        }
      );

      const resBody = await postRequest.json();

      console.log(jsonData);
      console.log(resBody);
    }
  };

  const handleClear = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setForm(initialForm);
  };

  return (
    <div id="parentContainer">
      <div id="title">Field Builder</div>
      <form id="form">
        <label className='formLabel' htmlFor="label">Label</label>
        <input className='formInput'
          onChange={handleFormChange}
          value={form.label}
          name="label"
          id="label"
          type="text"
        ></input>

        <label className='formLabel' htmlFor="required">Type</label>
        <div id="typeContainer">
          <p>Multi-select</p>
          <input
            onChange={handleFormChange}
            checked={form.required}
            name="required"
            id="required"
            type="checkbox"
          ></input>
          <p>A value is required</p>
        </div>

        <label className='formLabel' htmlFor="default">Default Value</label>
        <input className='formInput'
          onChange={handleFormChange}
          value={form.default}
          name="default"
          id="default"
          type="text"
        ></input>

        <label className='formLabel' htmlFor="choices">Choices</label>
        <textarea className='formInput'
          onChange={handleFormChange}
          value={form.choices}
          name="choices"
          id="choices"
        ></textarea>

        <label className='formLabel' >Order</label>
        <select className='formInput'
          onChange={handleFormChange}
          name="displayAlpha"
          value={form.displayAlpha}
        >
          <option value="alphabetical">Alphabetical</option>
          <option value="notAlphabetical">As Provided</option>
        </select>

        <div id="buttonContainer">
          <input
            id="submitButton"
            type="submit"
            value="Save Changes"
            onClick={handleSubmit}
          ></input>
          <p>Or</p>
          <button id="cancelButton" onClick={handleClear}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default FormBuilder;
