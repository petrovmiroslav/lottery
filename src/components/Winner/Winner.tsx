import React, { HTMLAttributes } from "react";
import classNames from "classnames";

type WinnerProps = {
  index: number;
  user: string;
} & Omit<HTMLAttributes<HTMLParagraphElement>, "children">;
const Winner = ({ className, index, user, ...restProps }: WinnerProps) => {
  return (
    <p className={classNames("winner", className)} {...restProps}>
      {`Призер  ${index} (№${user})`}
    </p>
  );
};
export default React.memo(Winner);
