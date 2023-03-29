import { useState } from 'react';
import { Progress } from 'reactstrap';
import { IChat } from '../../../types';
import { getTriggers } from '../../../utils';
import { ImportResult, ImportStep } from './ImportStep';
import { SelectFirstChatStep } from './SelectFirstChatStep';
import { VerifyStep } from './VerifyStep';

export interface TriggersSequenceImportBoxProps {
  onCancel: Function;
  onSuccess: Function;
}

export interface TriggerInfo {
  chatName: string;
  triggers: string[];
}

export enum ImportBoxStep {
  IMPORT = 'IMPORT',
  SELECT_FIRST_CHAT = 'SELECT_FIRS_CHAT',
  VERIFY = 'VERIFY',
}

export const TriggersSequenceImportBox = (props: TriggersSequenceImportBoxProps) => {
  const [step, setStep] = useState(ImportBoxStep.IMPORT);
  const [progressValue, setProgressValue] = useState(0);
  const [chats, setChats] = useState<ImportResult[]>([]);
  const [firstChat, setFirstChat] = useState('');

  const getTriggersSequence = (): TriggerInfo[] => {
    const triggers: TriggerInfo[] = [];
    for (const chat of chats) {
      const chatContent: IChat = JSON.parse(chat.data);
      const chatTriggers = getTriggers(chatContent.messages);

      triggers.push({
        chatName: chat.fileName,
        triggers: chatTriggers,
      });
    }
    return triggers;
  };

  const onCancel = () => {
    setChats([]);
    setFirstChat('');
    props.onCancel();
  };

  const onSuccess = () => {
    setChats([]);
    setFirstChat('');
    const triggers = getTriggersSequence();
    props.onSuccess(triggers);
  };

  const onStepChange = (step: ImportBoxStep) => {
    switch (step) {
      case ImportBoxStep.IMPORT:
        setProgressValue(0);
        break;
      case ImportBoxStep.SELECT_FIRST_CHAT:
        setProgressValue(50);
        break;
      case ImportBoxStep.VERIFY:
        setProgressValue(100);
        break;
    }
    setStep(step);
  };

  const getStepComponent = () => {
    switch (step) {
      case ImportBoxStep.IMPORT:
        return (
          <ImportStep
            data={chats}
            onImport={(data: ImportResult[]) => setChats(data)}
            onNext={() => onStepChange(ImportBoxStep.SELECT_FIRST_CHAT)}
            onCancel={() => onCancel()}
          />
        );
      case ImportBoxStep.SELECT_FIRST_CHAT:
        return (
          <SelectFirstChatStep
            data={chats}
            firstChat={firstChat}
            onSelect={(chat: string) => setFirstChat(chat)}
            onBack={() => onStepChange(ImportBoxStep.IMPORT)}
            onNext={() => onStepChange(ImportBoxStep.VERIFY)}
            onCancel={() => onCancel()}
          />
        );
      case ImportBoxStep.VERIFY:
        return (
          <VerifyStep
            data={chats}
            firstChat={firstChat}
            onBack={() => onStepChange(ImportBoxStep.SELECT_FIRST_CHAT)}
            onSubmit={() => onSuccess()}
            onCancel={() => onCancel()}
          />
        );
    }
  };

  return (
    <div className='import-box'>
      <Progress
        animated
        value={progressValue}
        color='success'
      />
      <div className='import-box-content'>
        {getStepComponent()}
      </div>
    </div>
  )
};