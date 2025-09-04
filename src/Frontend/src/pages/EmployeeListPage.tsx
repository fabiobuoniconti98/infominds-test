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

interface EmployeeListQuery {
  id: number;
  firstName: string;
  lastName: string;
  address: string;
  email: string;
  phone: string;
}

export default function EmployeeListPage() {
  const [list, setList] = useState<EmployeeListQuery[]>([]);
  const [firstNameFilter, setFirstNameFilter] = useDebounceValue<string>(
    "",
    500
  );
  const [lastNameFilter, setLastNameFilter] = useDebounceValue<string>("", 500);

  useEffect(() => {
    (async () => {
      const filterParams: { firstName?: string; lastName?: string } = {};
      if (firstNameFilter.trim()) {
        filterParams.firstName = firstNameFilter;
      }
      if (lastNameFilter.trim()) {
        filterParams.lastName = lastNameFilter;
      }
      const { data } = await axios.get<EmployeeListQuery[]>(
        "/api/employees/list",
        { params: filterParams }
      );
      setList(data);
    })();
  }, [firstNameFilter, lastNameFilter]);

  return (
    <>
      <Typography variant="h4" sx={{ textAlign: "center", mt: 4, mb: 4 }}>
        Employees
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
            placeholder="First Name"
            defaultValue={firstNameFilter}
            onChange={(e) => {
              setFirstNameFilter(e.currentTarget.value);
            }}
          />
          <Input
            placeholder="Last Name"
            defaultValue={lastNameFilter}
            onChange={(e) => {
              setLastNameFilter(e.currentTarget.value);
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
            link.setAttribute("download", `employees.xml`);

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
              <StyledTableHeadCell>First Name</StyledTableHeadCell>
              <StyledTableHeadCell>Last Name</StyledTableHeadCell>
              <StyledTableHeadCell>Address</StyledTableHeadCell>
              <StyledTableHeadCell>Email</StyledTableHeadCell>
              <StyledTableHeadCell>Phone</StyledTableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map((row) => (
              <TableRow
                key={row.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell>{row.firstName}</TableCell>
                <TableCell>{row.lastName}</TableCell>
                <TableCell>{row.address}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.phone}</TableCell>
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
