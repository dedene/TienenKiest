import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';

interface QuestionEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question?: {
    id: string;
    text: string;
    answer1Text?: string;
    answer2Text?: string;
  };
  onSave: (question: {
    id?: string;
    text: string;
    answer1Text?: string;
    answer2Text?: string;
  }) => Promise<void>;
}

export function QuestionEditor({ open, onOpenChange, question, onSave }: QuestionEditorProps) {
  const [text, setText] = useState('');
  const [answer1Text, setAnswer1Text] = useState('Ja');
  const [answer2Text, setAnswer2Text] = useState('Nee');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (question) {
      setText(question.text);
      setAnswer1Text(question.answer1Text || 'Ja');
      setAnswer2Text(question.answer2Text || 'Nee');
    } else {
      setText('');
      setAnswer1Text('Ja');
      setAnswer2Text('Nee');
    }
  }, [question]);

  const handleSave = async () => {
    if (!text.trim() || !answer1Text.trim() || !answer2Text.trim()) return;

    setIsSaving(true);
    try {
      await onSave({
        id: question?.id,
        text,
        answer1Text,
        answer2Text,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving question:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{question ? 'Vraag bewerken' : 'Nieuwe vraag'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="question-text" className="text-right">
              Vraag
            </Label>
            <Input
              id="question-text"
              className="col-span-3"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Vul de vraag in..."
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="answer1-text" className="text-right">
              Antwoord 1
            </Label>
            <Input
              id="answer1-text"
              className="col-span-3"
              value={answer1Text}
              onChange={(e) => setAnswer1Text(e.target.value)}
              placeholder="Vul het eerste antwoord in..."
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="answer2-text" className="text-right">
              Antwoord 2
            </Label>
            <Input
              id="answer2-text"
              className="col-span-3"
              value={answer2Text}
              onChange={(e) => setAnswer2Text(e.target.value)}
              placeholder="Vul het tweede antwoord in..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSave}
            disabled={isSaving || !text.trim() || !answer1Text.trim() || !answer2Text.trim()}
          >
            {isSaving ? 'Bezig met opslaan...' : 'Opslaan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
