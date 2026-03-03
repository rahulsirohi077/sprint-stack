import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TestComponent from "@/features/TestComponent";

export default function Home() {
  return (
    <div className="">
      <Input></Input>
      <Button >
        Primary
      </Button>
      <Button variant={'secondary'}>
        Secondary
      </Button>
      <Button variant={'destructive'}>
        destructive
      </Button>
      <Button variant={'ghost'}>
        ghost
      </Button>
      <Button variant={'muted'}>
        muted
      </Button>
      <Button variant={'outline'}>
        outline
      </Button>
      <Button variant={'teritary'} >
        teritary
      </Button>
    </div>
  );
}
