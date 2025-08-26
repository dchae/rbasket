import { Link } from "react-router";
import { AppBar, Toolbar, Button } from "@mui/material";
import LogoIcon from "../LogoIcon";

const Nav = () => {
  return (
    <AppBar
      position="static"
      sx={{
        borderRadius: 1,
        minWidth: "100%",
      }}
    >
      <Toolbar>
        <Button color="inherit" component={Link} to={"/"}>
          <LogoIcon sx={{ marginRight: 1 }} /> rBasket
        </Button>
        <Button
          color="inherit"
          href="https://github.com/dom-and-the-night-owls/rbasket"
          target="_blank"
        >
          github
        </Button>
        <Button
          color="inherit"
          href="https://github.com/dom-and-the-night-owls/rbasket/wiki/API-Documentation"
          target="_blank"
        >
          docs
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Nav;
