import {
  Box,
  Button,
  Input,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  styled,
  tableCellClasses,
} from "@mui/material";
import axios from "axios";
import { jsXml } from "json-xml-parse";
import { useEffect, useState } from "react";
import { useDebounceValue } from "usehooks-ts";

interface CustomerListQuery {
  id: number;
  name: string;
  address: string;
  email: string;
  phone: string;
  iban: string;
}

export default function CustomerListPage() {
  const [list, setList] = useState<CustomerListQuery[]>([]);
  const [nameFilter, setNameFilter] = useDebounceValue<string>("", 500);
  const [emailFilter, setEmailFilter] = useDebounceValue<string>("", 500);

  useEffect(() => {
    (async () => {
      const filterParams: { email?: string; name?: string } = {};
      if (nameFilter.trim()) {
        filterParams.name = nameFilter;
      }
      if (emailFilter.trim()) {
        filterParams.email = emailFilter;
      }
      const { data } = await axios.get<CustomerListQuery[]>(
        "/api/customers/list",
        { params: filterParams }
      );
      setList(data);
    })();
  }, [nameFilter, emailFilter]);

  return (
    <>
      <Typography variant="h4" sx={{ textAlign: "center", mt: 4, mb: 4 }}>
        Customers
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 4,
          marginBottom: 4,
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", gap: 4 }}>
          <Input
            placeholder="Name"
            defaultValue={nameFilter}
            onChange={(e) => {
              setNameFilter(e.currentTarget.value);
            }}
          />
          <Input
            placeholder="Email"
            defaultValue={emailFilter}
            onChange={(e) => {
              setEmailFilter(e.currentTarget.value);
            }}
          />
        </Box>
        <Button
          type="button"
          disabled={list.length === 0}
          onClick={() => {
            const xml = jsXml.toXmlString(list);
            const blob = new Blob([xml], { type: "text/plain" });
            // Create blob link to download
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `customers.xml`);

            // Append to html link element page
            document.body.appendChild(link);

            // Start download
            link.click();

            // Clean up and remove the link
            if (link.parentNode) {
              link.parentNode.removeChild(link);
            }
          }}
        >
          Download XML
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <StyledTableHeadCell>Name</StyledTableHeadCell>
              <StyledTableHeadCell>Address</StyledTableHeadCell>
              <StyledTableHeadCell>Email</StyledTableHeadCell>
              <StyledTableHeadCell>Phone</StyledTableHeadCell>
              <StyledTableHeadCell>Iban</StyledTableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map((row) => (
              <TableRow
                key={row.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.address}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.phone}</TableCell>
                <TableCell>{row.iban}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.common.white,
  },
}));
